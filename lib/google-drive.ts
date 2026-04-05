import { getGoogleAccessToken } from "@/lib/google-auth"

const GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive"

type DriveUploadResult = {
  id: string
  webViewLink?: string
  webContentLink?: string
}

function requireDriveFolderId(): string {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim()
  if (!folderId) {
    throw new Error("Google Drive folder is not configured. Set GOOGLE_DRIVE_FOLDER_ID.")
  }

  return folderId
}

function buildMultipartBody(params: {
  fileName: string
  mimeType: string
  fileBuffer: Buffer
  folderId: string
}): { body: Blob; contentType: string } {
  const boundary = `drive-upload-${Date.now()}-${Math.random().toString(16).slice(2)}`
  const metadata = JSON.stringify({
    name: params.fileName,
    parents: [params.folderId],
    mimeType: params.mimeType,
  })

  const preamble = Buffer.from(
    [
      `--${boundary}`,
      "Content-Type: application/json; charset=UTF-8",
      "",
      metadata,
      `--${boundary}`,
      `Content-Type: ${params.mimeType}`,
      "",
    ].join("\r\n"),
  )

  const closing = Buffer.from(`\r\n--${boundary}--`)

  return {
    body: new Blob([Buffer.concat([preamble, params.fileBuffer, closing])]),
    contentType: `multipart/related; boundary=${boundary}`,
  }
}

function encodeDriveFileId(fileId: string): string {
  return encodeURIComponent(fileId)
}

export function buildDriveViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${encodeDriveFileId(fileId)}/view?usp=sharing`
}

export function resolveResourcePdfUrl(pdfPath: string | null | undefined): string | null {
  if (!pdfPath) {
    return null
  }

  if (pdfPath.startsWith("http://") || pdfPath.startsWith("https://")) {
    return pdfPath
  }

  if (pdfPath.includes("/")) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    if (supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/resource-pdfs/${pdfPath}`
    }

    return null
  }

  return buildDriveViewUrl(pdfPath)
}

export async function uploadPdfToGoogleDrive(params: {
  fileName: string
  fileBuffer: Buffer
}): Promise<{ fileId: string; webViewLink: string }> {
  const folderId = requireDriveFolderId()
  const accessToken = await getGoogleAccessToken([GOOGLE_DRIVE_SCOPE])

  const { body, contentType } = buildMultipartBody({
    fileName: params.fileName,
    mimeType: "application/pdf",
    fileBuffer: params.fileBuffer,
    folderId,
  })

  const uploadResponse = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink&supportsAllDrives=true",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": contentType,
      },
      body,
    },
  )

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text()
    throw new Error(`Google Drive upload failed: ${errorText}`)
  }

  const json = (await uploadResponse.json()) as DriveUploadResult

  if (!json.id) {
    throw new Error("Google Drive upload failed: missing file id")
  }

  const permissionResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeDriveFileId(json.id)}/permissions?supportsAllDrives=true`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "reader",
        type: "anyone",
        allowFileDiscovery: false,
      }),
    },
  )

  if (!permissionResponse.ok) {
    const errorText = await permissionResponse.text()
    throw new Error(`Google Drive permission update failed: ${errorText}`)
  }

  return {
    fileId: json.id,
    webViewLink: json.webViewLink || buildDriveViewUrl(json.id),
  }
}

export async function deleteGoogleDriveFile(fileId: string): Promise<void> {
  const accessToken = await getGoogleAccessToken([GOOGLE_DRIVE_SCOPE])
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeDriveFileId(fileId)}?supportsAllDrives=true`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (!response.ok && response.status !== 404) {
    const errorText = await response.text()
    throw new Error(`Google Drive delete failed: ${errorText}`)
  }
}
