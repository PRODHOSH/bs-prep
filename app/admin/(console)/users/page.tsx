"use client"

import { useEffect, useMemo, useState } from "react"
import { SkRows } from "@/components/dashboard/skeleton"
import { BookOpen, CalendarDays, Edit3, Mail, ShieldCheck, Star, Trash2, UserRound } from "lucide-react"
import { Modal, Segmented, SearchBox, Tabs } from "@/components/dashboard/controls"
import { Avatar, EmptyState, Field, Notice, PageHeader, TableCard, Tag, btnDanger, btnGhost, btnPrimary, field, td, th } from "@/components/dashboard/ui"

type DirectoryUser = {
  id: string
  full_name: string | null
  first_name: string | null
  last_name: string | null
  email: string
  phone: string | null
  role: string | null
  avatar_url: string | null
  created_at: string
  is_enrolled: boolean
  mentor_subject: string | null
}

type UserEnrollment = {
  course_id: string
  title: string
  enrolled_at: string
  payment_status: string | null
}

export default function AdminUsersDirectoryPage() {
  const [users, setUsers] = useState<DirectoryUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [proFilter, setProFilter] = useState("all")

  const [enrolledUserIds, setEnrolledUserIds] = useState<Set<string>>(new Set())

  const [statusMessage, setStatusMessage] = useState("")

  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editFirstName, setEditFirstName] = useState("")
  const [editLastName, setEditLastName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editRole, setEditRole] = useState("")
  const [editMentorSubject, setEditMentorSubject] = useState("")
  const [editStatus, setEditStatus] = useState("")
  const [isEditProcessing, setIsEditProcessing] = useState(false)

  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [deletionStatus, setDeletionStatus] = useState("")
  const [isDeleteProcessing, setIsDeleteProcessing] = useState(false)
  const [deletingUserEmail, setDeletingUserEmail] = useState("")

  const [coursesUser, setCoursesUser] = useState<DirectoryUser | null>(null)
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [coursesError, setCoursesError] = useState("")
  const [userEnrollments, setUserEnrollments] = useState<UserEnrollment[]>([])

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/admin/users", { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to fetch users")
        const data = (await res.json()) as { users?: DirectoryUser[] }
        const loaded = Array.isArray(data.users) ? data.users : []
        setUsers(loaded)
        setEnrolledUserIds(new Set(loaded.filter((u) => u.is_enrolled).map((u) => u.id)))
      } catch {
        setUsers([])
      } finally {
        setIsLoading(false)
      }
    }

    void loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    let result = users

    if (roleFilter !== "all") {
      result = result.filter((u) => {
        const normalizedRole = (u.role || "student").toLowerCase()
        if (roleFilter === "admin") return normalizedRole === "admin"
        if (roleFilter === "mentor") return normalizedRole === "mentor"
        if (roleFilter === "student") return normalizedRole !== "admin" && normalizedRole !== "mentor"
        return true
      })
    }

    if (proFilter !== "all") {
      result = result.filter((u) => {
        const isPro = enrolledUserIds.has(u.id)
        if (proFilter === "pro") return isPro
        if (proFilter === "non-pro") return !isPro
        return true
      })
    }

    const query = searchValue.trim().toLowerCase()
    if (query) {
      result = result.filter((user) => {
        const fullName = (user.full_name || `${user.first_name ?? ""} ${user.last_name ?? ""}`).toLowerCase()
        return fullName.includes(query) || user.email.toLowerCase().includes(query)
      })
    }

    return result
  }, [searchValue, users, roleFilter, proFilter, enrolledUserIds])

  const admins = useMemo(
    () => filteredUsers.filter((u) => (u.role || "student").toLowerCase() === "admin"),
    [filteredUsers],
  )
  const mentors = useMemo(
    () => filteredUsers.filter((u) => (u.role || "student").toLowerCase() === "mentor"),
    [filteredUsers],
  )
  const students = useMemo(
    () =>
      filteredUsers.filter((u) => {
        const normalizedRole = (u.role || "student").toLowerCase()
        return normalizedRole !== "admin" && normalizedRole !== "mentor"
      }),
    [filteredUsers],
  )

  function startEditProfile(user: DirectoryUser) {
    setEditingUserId(user.id)
    setEditFirstName(user.first_name || "")
    setEditLastName(user.last_name || "")
    setEditPhone(user.phone || "")
    setEditRole(user.role || "student")
    setEditMentorSubject(user.mentor_subject || "")
    setEditStatus("")
  }

  function cancelEditProfile() {
    setEditingUserId(null)
    setEditFirstName("")
    setEditLastName("")
    setEditPhone("")
    setEditRole("")
    setEditStatus("")
  }

  async function saveProfileChanges() {
    if (!editingUserId) return

    setIsEditProcessing(true)
    setEditStatus("")

    try {
      const res = await fetch(`/api/admin/users/${editingUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: editFirstName.trim() || null,
          last_name: editLastName.trim() || null,
          phone: editPhone.trim() || null,
          role: editRole,
          mentor_subject: editMentorSubject.trim() || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setEditStatus(data.error || "Failed to update profile")
        return
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUserId
            ? {
                ...u,
                first_name: editFirstName.trim() || null,
                last_name: editLastName.trim() || null,
                phone: editPhone.trim() || null,
                role: editRole,
                mentor_subject: editMentorSubject.trim() || null,
              }
            : u,
        ),
      )

      setStatusMessage("User profile updated")
      cancelEditProfile()
    } catch {
      setEditStatus("Failed to update profile. Please try again.")
    } finally {
      setIsEditProcessing(false)
    }
  }

  async function initiateUserDeletion(user: DirectoryUser) {
    setDeletingUserId(user.id)
    setDeletingUserEmail(user.email)
    setDeletionStatus("")
  }

  async function deleteUserNow() {
    if (!deletingUserId) {
      setDeletionStatus("No user selected")
      return
    }

    setIsDeleteProcessing(true)

    try {
      const res = await fetch(`/api/admin/users/${deletingUserId}/initiate-deletion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await res.json()

      if (!res.ok) {
        setDeletionStatus(data.error || data.message || "Failed to delete user")
        return
      }

      setUsers((prev) => prev.filter((u) => u.id !== deletingUserId))
      setStatusMessage("User deleted successfully")
      closeDeleteModal()
    } catch {
      setDeletionStatus("Failed to delete user")
    } finally {
      setIsDeleteProcessing(false)
    }
  }

  function closeDeleteModal() {
    setDeletingUserId(null)
    setDeletionStatus("")
    setDeletingUserEmail("")
  }

  async function openCoursesModal(user: DirectoryUser) {
    setCoursesUser(user)
    setCoursesError("")
    setCoursesLoading(true)
    setUserEnrollments([])

    try {
      const res = await fetch(`/api/admin/users/${user.id}/enrollments`, { cache: "no-store" })
      const data = await res.json()

      if (!res.ok) {
        setCoursesError(data.error || "Failed to load enrollments")
        return
      }

      setUserEnrollments(Array.isArray(data.enrollments) ? data.enrollments : [])
    } catch {
      setCoursesError("Failed to load enrollments")
    } finally {
      setCoursesLoading(false)
    }
  }

  function closeCoursesModal() {
    setCoursesUser(null)
    setCoursesError("")
    setCoursesLoading(false)
    setUserEnrollments([])
  }

  const roleTag = (role: string | null) => {
    const r = (role || "student").toLowerCase()
    return r === "admin" ? (
      <Tag tone="primary"><ShieldCheck className="size-3" /> Admin</Tag>
    ) : r === "mentor" ? (
      <Tag tone="pink">Mentor</Tag>
    ) : (
      <Tag>Student</Tag>
    )
  }

  const iconBtn = "grid size-8 place-items-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Search, edit and manage everyone on BSPrep." />

      <div>
        <Tabs
          tabs={[
            { id: "all", label: "All", count: filteredUsers.length },
            { id: "student", label: "Students", count: students.length },
            { id: "mentor", label: "Mentors", count: mentors.length },
            { id: "admin", label: "Admins", count: admins.length },
          ]}
          value={roleFilter as "all" | "student" | "mentor" | "admin"}
          onChange={setRoleFilter}
        />
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Segmented
            options={[
              { id: "all", label: "Everyone" },
              { id: "pro", label: "Enrolled" },
              { id: "non-pro", label: "Not enrolled" },
            ]}
            value={proFilter as "all" | "pro" | "non-pro"}
            onChange={setProFilter}
          />
          <SearchBox value={searchValue} onChange={setSearchValue} placeholder="Search by name or email" className="ml-auto w-full sm:w-72" />
        </div>
      </div>

      {statusMessage && <Notice tone="success">{statusMessage}</Notice>}

      {isLoading ? (
        <SkRows rows={6} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState icon={UserRound} title="No users found" hint="Try a different filter or search term." />
      ) : (
        <TableCard footer={<span className="text-muted-foreground">{filteredUsers.length} users</span>}>
          <thead className="bg-muted/50">
            <tr>
              <th className={th}>User</th>
              <th className={th}>Role</th>
              <th className={th}>Joined</th>
              <th className={`${th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.map((user) => {
              const fullName = user.full_name || `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "Unnamed user"
              const isPro = enrolledUserIds.has(user.id)
              return (
                <tr key={user.id} className="transition-colors hover:bg-muted/40">
                  <td className={td}>
                    <span className="flex items-center gap-3">
                      <Avatar name={fullName} src={user.avatar_url} size={38} />
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="truncate font-bold">{fullName}</span>
                          {isPro && <Tag tone="amber"><Star className="size-3 fill-current" /> Enrolled</Tag>}
                        </span>
                        <span className="flex items-center gap-1 truncate text-xs text-muted-foreground"><Mail className="size-3" />{user.email}</span>
                        {user.phone && <span className="block text-xs text-muted-foreground">{user.phone}</span>}
                      </span>
                    </span>
                  </td>
                  <td className={td}>{roleTag(user.role)}</td>
                  <td className={`${td} text-muted-foreground`}>
                    <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />{new Date(user.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className={td}>
                    <span className="flex items-center justify-end gap-2">
                      <button onClick={() => openCoursesModal(user)} className={iconBtn} title="Enrolled courses" aria-label="Enrolled courses"><BookOpen className="size-4" /></button>
                      <button onClick={() => startEditProfile(user)} className={iconBtn} title="Edit user" aria-label="Edit user"><Edit3 className="size-4" /></button>
                      <button onClick={() => initiateUserDeletion(user)} className={`${iconBtn} hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive`} title="Delete user" aria-label="Delete user"><Trash2 className="size-4" /></button>
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </TableCard>
      )}

      <Modal open={!!editingUserId} onClose={cancelEditProfile} title="Edit user">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name"><input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} placeholder="First name" className={field} /></Field>
            <Field label="Last name"><input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} placeholder="Last name" className={field} /></Field>
          </div>
          <Field label="Phone"><input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone number" className={field} /></Field>
          <Field label="Role">
            <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className={field}>
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          {editRole === "mentor" && (
            <Field label="Mentor subject codes" hint="Comma separated, e.g. math-1, stats-2, python, ct">
              <input value={editMentorSubject} onChange={(e) => setEditMentorSubject(e.target.value)} placeholder="math-1, stats-2" className={field} />
            </Field>
          )}
          {editStatus && <Notice tone="error">{editStatus}</Notice>}
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={cancelEditProfile} disabled={isEditProcessing} className={btnGhost}>Cancel</button>
            <button onClick={saveProfileChanges} disabled={isEditProcessing} className={btnPrimary}>{isEditProcessing ? "Saving…" : "Save changes"}</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deletingUserId} onClose={closeDeleteModal} title="Delete user">
        <p className="text-sm text-muted-foreground">
          This permanently deletes <span className="font-semibold text-foreground">{deletingUserEmail}</span> and all related data. It can&apos;t be undone.
        </p>
        {deletionStatus && <Notice tone="error" className="mt-3 whitespace-pre-wrap">{deletionStatus}</Notice>}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={closeDeleteModal} disabled={isDeleteProcessing} className={btnGhost}>Cancel</button>
          <button onClick={deleteUserNow} disabled={isDeleteProcessing} className={btnDanger}>{isDeleteProcessing ? "Deleting…" : "Delete permanently"}</button>
        </div>
      </Modal>

      <Modal open={!!coursesUser} onClose={closeCoursesModal} title="Enrolled courses" width="max-w-lg">
        {coursesUser && (
          <>
            <p className="-mt-2 mb-4 text-sm text-muted-foreground">{coursesUser.full_name || coursesUser.email}</p>
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {coursesLoading ? (
                <SkRows rows={2} />
              ) : coursesError ? (
                <Notice tone="error">{coursesError}</Notice>
              ) : userEnrollments.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">This user hasn&apos;t enrolled in any course yet.</p>
              ) : (
                userEnrollments.map((item) => (
                  <article key={`${coursesUser.id}-${item.course_id}-${item.enrolled_at}`} className="rounded-xl border bg-muted/40 px-4 py-3">
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.course_id}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Enrolled {item.enrolled_at && !Number.isNaN(new Date(item.enrolled_at).getTime()) ? new Date(item.enrolled_at).toLocaleDateString() : "-"}</span>
                      <Tag tone="green" className="capitalize">{item.payment_status || "completed"}</Tag>
                    </div>
                  </article>
                ))
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
