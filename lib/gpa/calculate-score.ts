import { courseData } from "./course-data"

export function calculateScore(courseId: string, values: Record<string, number>): number {
  let baseScore = 0

  switch (courseId) {
    // Foundation Level
    case "mds1":
    case "eng1":
    case "ct":
    case "mds2":
      return Math.min(
        (0.1 * values.GAA +
          Math.max(
            0.6 * values.F + 0.2 * Math.max(values.Qz1, values.Qz2),
            0.4 * values.F + 0.2 * values.Qz1 + 0.3 * values.Qz2,
          )) *
          (1 + 0.01 * (values.Extra || 0)),
        100,
      )

    case "eng2":
      return (
        0.1 * values.GAA +
        Math.max(
          0.6 * values.F + 0.2 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.2 * values.Qz1 + 0.3 * values.Qz2,
        )
      )

    case "stats1":
    case "stats2":
      return (
        0.1 * values.GAA +
        Math.max(
          0.6 * values.F + 0.2 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.2 * values.Qz1 + 0.3 * values.Qz2,
        ) +
        (values.Extra || 0)
      )

    case "python":
      return (
        0.1 * values.GAA1 +
        0.1 * values.GAA2 +
        0.1 * values.Qz1 +
        0.4 * values.F +
        0.25 * Math.max(values.PE1, values.PE2) +
        0.15 * Math.min(values.PE1, values.PE2)
      )

    // Diploma Level
    case "mlf":
      return (
        0.1 * values.GAA +
        Math.max(
          0.6 * values.F + 0.2 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.2 * values.Qz1 + 0.3 * values.Qz2,
        )
      )

    case "mlt":
      return (
        0.1 * values.GAA +
        0.4 * values.F +
        Math.max(0.25 * values.Qz1 + 0.25 * values.Qz2, 0.4 * Math.max(values.Qz1, values.Qz2))
      )

    case "mlp":
      return 0.1 * values.GAA + 0.3 * values.F + 0.2 * values.OPE1 + 0.2 * values.OPE2 + 0.2 * values.KA

    // Added missing Diploma Level courses
    case "bdm":
      return 0.3 * values.GA + 0.2 * values.Q2 + 0.2 * values.TA + 0.3 * values.F

    case "ban":
      return 0.7 * Math.max(values.Qz1, values.Qz2) + 0.3 * Math.min(values.Qz1, values.Qz2)

    case "tds":
      return 0.2 * values.GAA + 0.2 * values.ROE1 + 0.2 * values.P1 + 0.2 * values.P2 + 0.2 * values.F

    case "dl-genAI":
      return 0.2 * values.GAA + 0.15 * values.Qz1 + 0.15 * values.Qz2 + 0.2 * values.F + 0.15 * values.NPPE1 + 0.15 * values.NPPE2 

    case "pds":
    case "pdsa":
      return (
        0.1 * values.GAA +
        0.4 * values.F +
        0.2 * values.OP +
        Math.max(0.2 * Math.max(values.Qz1, values.Qz2), 0.15 * values.Qz1 + 0.15 * values.Qz2)
      )

    case "dbms":
      return (
        0.04 * values.GAA1 +
        0.03 * values.GAA2 +
        0.03 * values.GAA3 +
        0.2 * values.OP +
        Math.max(
          0.45 * values.F + 0.15 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.1 * values.Qz1 + 0.2 * values.Qz2,
        )
      )

    case "ad1":
    case "appdev-1":
      return (
        0.15 * values.GLA +
        0.05 * values.GA +
        Math.max(
          0.35 * values.F + 0.2 * values.Qz1 + 0.25 * values.Qz2,
          0.4 * values.F + 0.3 * Math.max(values.Qz1, values.Qz2),
        )
      )

    case "java":
      return (
        0.1 * values.GAA +
        0.3 * values.F +
        0.2 * Math.max(values.PE1, values.PE2) +
        0.1 * Math.min(values.PE1, values.PE2) +
        Math.max(0.25 * Math.max(values.Qz1, values.Qz2), 0.15 * values.Qz1 + 0.25 * values.Qz2)
      )

    case "sys":
    case "sc":
      return 0.1 * values.GAA + 0.2 * values.Qz1 + 0.3 * values.OPE + 0.3 * values.F + 0.1 * values.BPTA

    case "ad2":
    case "appdev-2":
      return (
        0.05 * values.GAA1 +
        0.05 * values.GAA2 +
        Math.max(
          0.35 * values.F + 0.25 * values.Qz1 + 0.3 * values.Qz2,
          0.5 * values.F + 0.3 * Math.max(values.Qz1, values.Qz2),
        )
      )

    // Degree Level
    case "st":
      return 0.1 * values.GAA + 0.4 * values.F + 0.25 * values.Qz1 + 0.25 * values.Qz2

    case "se":
      return (
        0.05 * values.GAA +
        0.2 * values.Qz2 +
        0.4 * values.F +
        0.1 * values.GP1 +
        0.1 * values.GP2 +
        0.1 * values.PP +
        0.05 * values.CP
      )

    case "dl":
      return (
        0.1 * values.GAA +
        Math.max(
          0.4 * values.F + 0.25 * values.Qz1 + 0.25 * values.Qz2,
          0.5 * values.F + 0.3 * Math.max(values.Qz1, values.Qz2),
        )
      )

    case "ai-search":
      return (
        0.1 * values.GAA +
        Math.max(
          0.45 * values.F + 0.35 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.25 * values.Qz1 + 0.25 * values.Qz2,
        )
      )

    case "llm":
      return 0.1 * values.GAA + 0.4 * values.F + 0.25 * values.Qz1 + 0.25 * values.Qz2

    // Added missing Degree Level courses
    case "spg":
      return 0.15 * values.GAA + 0.25 * values.GP + 0.25 * values.Qz2 + 0.35 * values.F

    case "ibd":
      return 0.1 * values.GAA + 0.3 * values.F + 0.2 * values.OPPE1 + 0.4 * values.OPPE2

    case "dlcv":
      return (
        0.1 * values.GAA +
        0.5 * values.F +
        Math.max(0.2 * values.Qz1 + 0.2 * values.Qz2, 0.3 * Math.max(values.Qz1, values.Qz2))
      )

    case "dv":
      return (
        0.3 * values.GA +
        Math.max(0.2 * values.Qz1 + 0.2 * values.Qz2, 0.3 * Math.max(values.Qz1, values.Qz2)) +
        0.3 * values.P
      )

    case "me":
      return (
        0.15 * values.GAA +
        Math.max(
          0.2 * values.Qz1 + 0.2 * values.Qz2 + 0.45 * values.F,
          0.5 * values.F + 0.25 * Math.max(values.Qz1, values.Qz2),
        )
      )

    case "atb":
      return (
        0.2 * values.GAA +
        Math.max(
          0.2 * values.Qz1 + 0.2 * values.Qz2 + 0.4 * values.F,
          0.45 * values.F + 0.25 * Math.max(values.Qz1, values.Qz2),
        )
      )

    case "i4":
      return values.A + 0.3 * values.F + 0.15 * (values.Qz1 + values.Qz2) + 0.05 * values.Game + 0.1 * values.Project

    case "mt":
      return (
        0.1 * values.GAA +
        Math.max(
          0.6 * values.F + 0.2 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.2 * values.Qz1 + 0.3 * values.Qz2,
        )
      )

    case "lsm":
      return (
        0.1 * values.GAA +
        0.5 * values.F +
        Math.max(0.2 * values.Qz1 + 0.2 * values.Qz2, 0.3 * Math.max(values.Qz1, values.Qz2))
      )

    case "cprog":
      return (
        0.05 * values.GAA +
        0.1 * values.GAAP +
        0.15 * values.Qz1 +
        0.2 * values.OPPE1 +
        0.2 * values.OPPE2 +
        0.3 * values.F
      )

    case "ff":
      return (
        0.1 * values.GAA +
        Math.max(
          0.25 * values.Qz1 + 0.3 * values.GP1 + 0.35 * values.F,
          0.5 * values.F + 0.3 * Math.max(values.Qz1, values.GP1),
        )
      )

    case "nlp":
      return 0.1 * values.GAA + 0.5 * values.F + 0.2 * values.Qz1 + 0.2 * values.Qz2

    case "cf":
      return 0.1 * values.GAA + 0.4 * values.F + 0.2 * values.Qz1 + 0.3 * values.Qz2

    case "dlp":
      return (
        0.2 * values.GA +
        0.15 * values.Quiz1 +
        0.15 * values.Quiz2 +
        0.15 * values.Quiz3 +
        0.2 * values.BestNPPE +
        0.15 * values.SecondBestNPPE +
        0.1 * values.LowestNPPE
      )

    case "os":
      return 0.1 * values.GAA + 0.4 * values.F + 0.25 * values.Qz1 + 0.25 * values.Qz2

    case "stml":
      return (
        0.1 * values.GAA +
        0.2 * values.GPA +
        Math.max(0.2 * values.Qz1 + 0.2 * values.Qz2, 0.3 * Math.max(values.Qz1, values.Qz2)) +
        0.3 * values.F
      )

    case "bdbn":
      return (
        0.15 * values.GAA +
        Math.max(
          0.2 * values.Qz1 + 0.2 * values.Qz2 + 0.45 * values.F,
          0.5 * values.F + 0.25 * Math.max(values.Qz1, values.Qz2),
        )
      )

    // Foundation Level - Electronic Systems
    case "eng1-es":
    case "math-elec1":
    case "estc":
    case "eng2-es":
    case "digital-systems":
    case "elec-circuits":
      return (
        0.1 * values.GAA +
        Math.max(
          0.6 * values.F + 0.2 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.2 * values.Qz1 + 0.3 * values.Qz2,
        )
      )

    case "estc-lab":
    case "sensors-lab":
      return values.Attendance * (0.5 * values.experiment + 0.5 * values.Report)

    case "c-prog":
      return (
        0.1 * values.GAA +
        0.2 * values.Qz1 +
        0.4 * values.F +
        Math.max(0.15 * values.OPPE1 + 0.15 * values.OPPE2, 0.2 * Math.max(values.OPPE1, values.OPPE2))
      )

    case "c-prog-lab":
      return 0.5 * values.TLA + 0.5 * values.IL

    case "linux-prog":
      return (
        0.1 * values.GAA +
        0.05 * values.NPPE +
        0.2 * values.Qz1 +
        0.25 * values.OPPE +
        0.3 * values.F +
        0.05 * values.BPTA +
        0.05 * values.VMT
      )

    case "linux-shell-lab":
      return 0.5 * values.OL + 0.5 * values.IL

    case "electronics-lab":
    case "analog-lab":
      return 0.4 * values.WE + 0.6 * values.ID

    case "embedded-c":
    case "digital-system-design":
      return (
        0.1 * values.GAA +
        0.1 * values.GRPA +
        Math.max(
          0.5 * values.F + 0.2 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.2 * values.Qz1 + 0.2 * values.Qz2,
        )
      )

    case "embedded-c-lab":
    case "digital-system-lab":
      return 0.2 * values.Attendance + 0.8 * values.LabExperiment

    // Diploma Level - Electronic Systems
    case "math-elec2":
    case "analog-systems":
    case "sensors":
      return (
        0.1 * values.GAA +
        Math.max(
          0.6 * values.F + 0.2 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.2 * values.Qz1 + 0.3 * values.Qz2,
        )
      )

    case "signals-systems":
      return (
        0.1 * values.GAA +
        Math.max(
          0.5 * values.F + 0.2 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.2 * values.Qz1 + 0.2 * values.Qz2,
        ) +
        0.1 * values.GrPA
      )

    case "python-es":
      return (
        0.1 * values.GAA1 +
        0.1 * values.GAA2 +
        0.1 * values.Qz1 +
        0.4 * values.F +
        0.25 * Math.max(values.PE1, values.PE2) +
        0.15 * Math.min(values.PE1, values.PE2)
      )

    case "dsp":
      return (
        0.1 * values.GAA +
        0.1 * values.LE +
        0.05 * values.LV +
        Math.max(
          0.55 * values.F + 0.1 * Math.max(values.Qz1, values.Qz2),
          0.45 * values.F + 0.15 * values.Qz1 + 0.15 * values.Qz2,
        )
      )

    case "control-eng":
      baseScore = 0.1 * values.GAA + 0.5 * values.F + 0.2 * values.Qz1 + 0.2 * values.Qz2
      break

    default:
      // For any course ID not explicitly handled, try to use the formula from courseData
      const course = courseData.find((c) => c.id === courseId)
      if (course) {
        // This is a simplified fallback that assumes a standard formula
        baseScore = (values.GAA || 0) * 0.1 + (values.F || 0) * 0.5 + (values.Qz1 || 0) * 0.2 + (values.Qz2 || 0) * 0.2
      } else {
        throw new Error(`Unknown course ID: ${courseId}`)
      }
  }

  // Apply bonus marks only if base score >= 40
  const bonus = values.Bonus || 0
  if (baseScore >= 40 && bonus > 0) {
    baseScore = Math.min(baseScore + bonus, 100)
  }

  return baseScore
}
