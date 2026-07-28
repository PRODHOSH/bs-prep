import { courseData } from "./course-data"

export function calculateScore(courseId: string, values: Record<string, number>): number {
  let baseScore = 0

  switch (courseId) {
    // Foundation Level
    case "mds1":
    case "eng1":
    case "ct":
    case "eng2":
      baseScore = Math.max(
        0.6 * values.F + 0.3 * Math.max(values.Qz1, values.Qz2),
        0.45 * values.F + 0.25 * values.Qz1 + 0.3 * values.Qz2,
      )
      break

    case "mds2":
      baseScore = Math.max(
        0.6 * values.F + 0.3 * Math.max(values.Qz1, values.Qz2),
        0.45 * values.F + 0.25 * values.Qz1 + 0.3 * values.Qz2,
      )
      break

    case "stats1":
    case "stats2":
      baseScore = Math.max(
        0.6 * values.F + 0.3 * Math.max(values.Qz1, values.Qz2),
        0.45 * values.F + 0.25 * values.Qz1 + 0.3 * values.Qz2,
      )
      break

    case "python":
      return (
        0.15 * values.Qz1 +
        0.4 * values.F +
        0.25 * Math.max(values.PE1, values.PE2) +
        0.2 * Math.min(values.PE1, values.PE2)
      )

    // Diploma Level
    case "mlf":
      return (
        0.05 * values.GAA +
        Math.max(
          0.6 * values.F + 0.25 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.25 * values.Qz1 + 0.3 * values.Qz2,
        )
      )

    case "mlt":
      baseScore = (
        0.05 * values.GAA +
        Math.max(
          0.6 * values.F + 0.25 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.25 * values.Qz1 + 0.3 * values.Qz2,
        )
      )
      // Add 3 marks bonus if GAA >= 40
      if (values.GAA >= 40) {
        baseScore += Math.min(3, values.ProgrammingBonus || 0)
      }
      return baseScore

    case "mlp":
      return 0.1 * values.GAA + 0.3 * values.F + 0.2 * values.OPPE1 + 0.2 * values.OPPE2 + 0.2 * values.KA

    // Added missing Diploma Level courses
    case "bdm":
      return (
        0.05 * values.GAA +
        Math.max(
          0.6 * values.F + 0.25 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.25 * values.Qz1 + 0.3 * values.Qz2,
        )
      )

    case "ban":
      return (
        0.4 * (0.7 * Math.max(values.Qz1, values.Qz2) + 0.3 * Math.min(values.Qz1, values.Qz2)) +
        0.2 * values.A +
        0.4 * values.F
      )

    case "tds":
      return 0.2 * values.GAA + 0.2 * values.ROE + 0.2 * values.P1 + 0.2 * values.P2 + 0.2 * values.F

    case "dl-genAI":
      return 0.1 * values.GAA + 0.2 * values.Qz1 + 0.2 * values.Qz2 + 0.25 * values.F + 0.1 * values.NPPE1 + 0.15 * values.NPPE2 

    case "pds":
    case "pdsa":
      return (
        0.05 * values.GAA +
        0.2 * values.OP +
        0.45 * values.F +
        Math.max(0.2 * Math.max(values.Qz1, values.Qz2), 0.1 * values.Qz1 + 0.2 * values.Qz2)
      )

    case "dbms":
      return (
        0.03 * values.GAA2 +
        0.02 * values.GAA3 +
        0.2 * values.OP +
        0.45 * values.F +
        Math.max(0.2 * Math.max(values.Qz1, values.Qz2), 0.1 * values.Qz1 + 0.2 * values.Qz2)
      )

    case "ad1":
    case "appdev-1":
      return (
        0.05 * values.GLA +
        Math.max(
          0.6 * values.F + 0.25 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.25 * values.Qz1 + 0.3 * values.Qz2,
        )
      )

    case "java":
      return (
        0.05 * values.GAA +
        0.2 * Math.max(values.PE1, values.PE2) +
        0.45 * values.F +
        Math.max(0.2 * Math.max(values.Qz1, values.Qz2), 0.1 * values.Qz1 + 0.2 * values.Qz2) +
        0.1 * Math.min(values.PE1, values.PE2)
      )

    case "sys":
    case "sc":
      return 0.05 * values.GAA + 0.25 * values.Qz1 + 0.3 * values.OPPE + 0.3 * values.F + 0.1 * values.BPTA

    case "ad2":
    case "appdev-2":
      return (
        0.05 * values.GAA +
        Math.max(
          0.6 * values.F + 0.25 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.25 * values.Qz1 + 0.3 * values.Qz2,
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
      baseScore = 0.05 * values.GAA + 0.25 * values.Qz1 + 0.25 * values.Qz2 + 0.45 * values.F
      if (baseScore >= 40) {
        baseScore += Math.min(5, values.ProgrammingBonus || 0)
      }
      return baseScore

    case "ai-search":
      baseScore = 0.1 * values.GAA + 0.4 * values.F + 0.25 * values.Qz1 + 0.25 * values.Qz2
      if (baseScore >= 40) {
        baseScore += Math.min(5, values.ProgrammingBonus || 0)
      }
      return baseScore

    case "llm":
      baseScore = 0.05 * values.GAA + 0.35 * values.F + 0.3 * values.Qz1 + 0.3 * values.Qz2
      if (baseScore >= 40) {
        baseScore += Math.min(5, values.Bonus || 0)
      }
      return baseScore

    case "spg":
      return 0.15 * values.GAA + 0.25 * values.GP + 0.25 * values.Qz2 + 0.35 * values.F

    case "ibd":
      return 0.1 * values.GAA + 0.3 * values.F + 0.2 * values.OPPE1 + 0.4 * values.OPPE2

    case "dlcv":
      baseScore = (
        0.1 * values.GAA +
        0.4 * values.F +
        0.25 * values.Qz1 +
        0.25 * values.Qz2
      )
      if (baseScore >= 40) {
        baseScore += Math.min(5, values.Bonus || 0)
      }
      return baseScore

    case "dv":
      baseScore = (
        0.3 * values.GA +
        Math.max(0.2 * values.Qz1 + 0.2 * values.Qz2, 0.3 * Math.max(values.Qz1, values.Qz2)) +
        0.3 * values.P
      )
      if (baseScore >= 40) {
        baseScore += Math.min(5, values.Bonus || 0)
      }
      return baseScore

    case "me":
      return 0.1 * values.GAA + 0.4 * values.F + 0.25 * values.Qz1 + 0.25 * values.Qz2

    case "atb":
      return 0.075 * values.GAA + 0.025 * values.GAAP + 0.25 * values.Qz1 + 0.25 * values.Qz2 + 0.4 * values.F

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
      baseScore = (
        0.1 * values.GAA +
        Math.max(
          0.6 * values.F + 0.2 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.25 * values.Qz1 + 0.25 * values.Qz2,
        )
      )
      if (baseScore >= 40) {
        baseScore += (values.NormalBonus || 0)
      }
      return baseScore

    case "cprog":
      return 0.1 * values.GAA + 0.2 * values.Qz1 + 0.2 * values.OPPE1 + 0.2 * values.OPPE2 + 0.3 * values.F

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
        0.05 * values.GA +
        0.15 * values.Quiz1 +
        0.15 * values.Quiz2 +
        0.15 * values.Quiz3 +
        0.25 * ((values.NPPE1 + values.NPPE2 + values.NPPE3) / 3) +
        0.25 * values.Viva
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

    // Additional Data Science Degree courses from grading_docs
    case "dsai-lab":
      baseScore = 0.05 * values.GAA + 0.25 * values.Quiz + 0.4 * values.P + 0.3 * values.V
      if (baseScore >= 40 && values.Bonus) {
        baseScore += Math.min(5, values.Bonus)
      }
      return baseScore

    case "appdev-lab":
      return 0.3 * values.GAA + 0.2 * values.Qz2 + 0.5 * values.V

    case "mr":
      return 0.1 * values.GAA + 0.2 * values.Qz1 + 0.2 * values.Qz2 + 0.25 * values.P + 0.25 * values.F

    case "mlops":
      baseScore = 0.2 * values.GAA + 0.3 * values.F + 0.25 * values.OPPE1 + 0.25 * values.OPPE2
      if (baseScore >= 40 && values.Bonus) {
        baseScore += Math.min(5, values.Bonus)
      }
      return baseScore

    case "mf-genAI":
      return 0.05 * values.GAA + 0.35 * values.F + 0.2 * values.Qz1 + 0.2 * values.Qz2 + 0.2 * values.NPPE

    case "dt-appdev":
      return (
        0.1 * values.GAA +
        0.1 * values.GP1 +
        0.1 * values.GP2 +
        0.2 * values.GP3 +
        0.2 * values.Qz2 +
        0.3 * values.F
      )

    case "ps-osm":
      return 0.2 * values.GAA + 0.3 * values.F + 0.25 * values.Qz1 + 0.25 * values.Qz2

    case "cs-design":
      return 0.1 * values.GAA + 0.4 * values.F + 0.2 * values.Qz1 + 0.25 * values.Qz2 + 0.05 * values.CVA

    case "gts":
    case "dm":
    case "cd":
    case "toc":
      return 0.1 * values.GAA + 0.4 * values.F + 0.25 * values.Qz1 + 0.25 * values.Qz2

    case "ads":
      baseScore = 0.1 * values.GAA + 0.1 * values.PAA + 0.45 * values.F + 0.35 * values.Qz2
      if (baseScore >= 40 && values.Bonus) {
        baseScore += Math.min(4, values.Bonus)
      }
      return baseScore

    // Foundation Level - Electronic Systems
    case "eng1-es":
    case "math-elec1":
    case "estc":
    case "eng2-es":
    case "digital-systems":
      return Math.max(
        0.6 * values.F + 0.3 * Math.max(values.Qz1, values.Qz2),
        0.45 * values.F + 0.25 * values.Qz1 + 0.3 * values.Qz2,
      )

    case "elec-circuits":
      baseScore = Math.max(
        0.6 * values.F + 0.3 * Math.max(values.Qz1, values.Qz2),
        0.45 * values.F + 0.25 * values.Qz1 + 0.3 * values.Qz2,
      )
      break

    case "estc-lab":
      return 0.5 * values.experiment + 0.5 * values.Report

    case "c-prog":
      return (
        0.25 * values.Qz1 +
        0.45 * values.F +
        Math.max(0.15 * values.OPPE1 + 0.15 * values.OPPE2, 0.2 * Math.max(values.OPPE1, values.OPPE2))
      )

    case "c-prog-lab":
      return 0.5 * values.TLA + 0.5 * values.IL

    case "linux-prog":
      return (
        0.25 * values.Qz1 +
        0.25 * values.OPPE +
        0.35 * values.F +
        0.1 * values.BPTA +
        0.05 * values.VMT
      )

    case "linux-shell-lab":
      return 0.5 * values.OL + 0.5 * values.IL

    case "electronics-lab":
    case "analog-lab":
    case "sensors-lab":
    case "digital-system-lab":
      return 0.4 * values.WE + 0.6 * values.ID

    case "embedded-c":
      return (
        0.1 * values.GRPA +
        Math.max(
          0.5 * values.F + 0.3 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.25 * values.Qz1 + 0.25 * values.Qz2,
        )
      )

    case "embedded-c-lab":
    case "embedded-linux-lab":
      return 0.2 * values.Attendance + 0.8 * values.LabExperiment

    // Diploma Level - Electronic Systems
    case "analog-systems":
    case "sensors":
      return (
        0.05 * values.GAA +
        Math.max(
          0.6 * values.F + 0.25 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.25 * values.Qz1 + 0.3 * values.Qz2,
        )
      )

    case "signals-systems":
      return (
        0.05 * values.GAA +
        Math.max(
          0.5 * values.F + 0.25 * Math.max(values.Qz1, values.Qz2),
          0.45 * values.F + 0.2 * values.Qz1 + 0.2 * values.Qz2,
        ) +
        0.1 * values.GrPA
      )

    case "python-es":
      return Math.min(
        100,
        0.05 * values.GAA1 +
          0.05 * values.GAA2 +
          0.15 * values.Qz1 +
          0.45 * values.F +
          0.25 * Math.max(values.PE1, values.PE2) +
          0.15 * Math.min(values.PE1, values.PE2),
      )

    case "dsp":
      return (
        0.05 * values.GAA +
        0.1 * values.LE +
        0.05 * values.OLEx +
        Math.max(
          0.55 * values.F + 0.15 * Math.max(values.Qz1, values.Qz2),
          0.5 * values.F + 0.15 * values.Qz1 + 0.15 * values.Qz2,
        )
      )

    case "digital-system-design":
    case "computer-org":
      return (
        0.05 * values.GAA +
        Math.max(
          0.6 * values.F + 0.25 * Math.max(values.Qz1, values.Qz2),
          0.5 * values.F + 0.2 * values.Qz1 + 0.25 * values.Qz2,
        )
      )

    case "electronic-testing":
      return (
        0.1 * values.GAA +
        Math.max(
          0.6 * values.F + 0.2 * Math.max(values.Qz1, values.Qz2),
          0.5 * values.F + 0.2 * values.Qz1 + 0.2 * values.Qz2,
        )
      )

    // Degree Level - Electronic Systems
    case "control-eng":
      return 0.1 * values.GAA + 0.45 * values.F + 0.2 * values.Qz1 + 0.2 * values.Qz2 + 0.05 * values.D

    case "em-fields":
    case "math-elec2":
    case "comm-systems":
    case "analog-circuits":
    case "vlsi":
      return (
        0.1 * values.GAA +
        Math.max(
          0.6 * values.F + 0.2 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.2 * values.Qz1 + 0.3 * values.Qz2,
        )
      )

    case "epd":
      return 0.3 * values.GAA + 0.2 * (values.Qz1 + values.Qz2) + 0.3 * values.F

    case "spg-es":
      return 0.15 * values.GAA + 0.25 * values.GP + 0.25 * values.Qz2 + 0.35 * values.F

    case "embedded-linux":
      return (
        0.1 * values.GAA +
        Math.max(
          0.5 * values.F + 0.2 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.25 * values.Qz1 + 0.25 * values.Qz2,
        )
      )

    case "digital-ic":
      return (
        0.1 * values.GAA +
        0.3 * values.P +
        Math.max(
          0.3 * values.F + 0.2 * Math.max(values.Qz1, values.Qz2),
          0.3 * values.F + 0.15 * values.Qz1 + 0.15 * values.Qz2,
        )
      )

    case "mlf-es":
    case "appdev2-es":
      return (
        0.05 * values.GAA +
        Math.max(
          0.6 * values.F + 0.25 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.25 * values.Qz1 + 0.3 * values.Qz2,
        )
      )

    case "appdev1-es":
      return (
        0.05 * values.GLA +
        Math.max(
          0.6 * values.F + 0.25 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.25 * values.Qz1 + 0.3 * values.Qz2,
        )
      )

    case "mlt-es":
      baseScore = (
        0.05 * values.GAA +
        Math.max(
          0.6 * values.F + 0.25 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.25 * values.Qz1 + 0.3 * values.Qz2,
        )
      )
      break

    case "mlp-es":
      return 0.1 * values.GAA + 0.3 * values.F + 0.2 * values.OPPE1 + 0.2 * values.OPPE2 + 0.2 * values.KA

    case "dl-es":
      baseScore = 0.05 * values.GAA + 0.25 * values.Qz1 + 0.25 * values.Qz2 + 0.45 * values.F
      break

    case "dlcv-es":
    case "gts-es":
      return 0.1 * values.GAA + 0.4 * values.F + 0.25 * values.Qz1 + 0.25 * values.Qz2

    case "dlp-es":
      return (
        0.05 * values.GAA +
        0.15 * values.Qz1 +
        0.15 * values.Qz2 +
        0.15 * values.Qz3 +
        0.25 * ((values.NPPE1 + values.NPPE2 + values.NPPE3) / 3) +
        0.25 * values.Viva
      )

    case "dbms-es":
      return (
        0.03 * values.GAA2 +
        0.02 * values.GAA3 +
        0.2 * values.OP +
        0.45 * values.F +
        Math.max(0.2 * Math.max(values.Qz1, values.Qz2), 0.1 * values.Qz1 + 0.2 * values.Qz2)
      )

    case "pdsa-es":
      return (
        0.05 * values.GAA +
        0.2 * values.OP +
        0.45 * values.F +
        Math.max(0.2 * Math.max(values.Qz1, values.Qz2), 0.1 * values.Qz1 + 0.2 * values.Qz2)
      )

    case "java-es":
      return Math.min(
        100,
        0.05 * values.GAA +
          0.2 * Math.max(values.PE1, values.PE2) +
          0.45 * values.F +
          Math.max(0.2 * Math.max(values.Qz1, values.Qz2), 0.1 * values.Qz1 + 0.2 * values.Qz2) +
          0.1 * Math.min(values.PE1, values.PE2),
      )

    case "dt-appdev-es":
      return (
        0.1 * values.GAA +
        0.1 * values.GP1 +
        0.1 * values.GP2 +
        0.2 * values.GP3 +
        0.2 * values.Qz2 +
        0.3 * values.F
      )

    case "mr-es":
      return 0.1 * values.GAA + 0.2 * values.Qz1 + 0.2 * values.Qz2 + 0.25 * values.P + 0.25 * values.F

    case "me-es":
      return (
        0.15 * values.GAA +
        Math.max(
          0.2 * values.Qz1 + 0.2 * values.Qz2 + 0.45 * values.F,
          0.5 * values.F + 0.25 * Math.max(values.Qz1, values.Qz2),
        )
      )

    // Aeronautics & Management - Foundation Level Standard Courses
    case "eng1-ae":
    case "math-elec1-ae":
    case "estc-ae":
    case "eng2-ae":
    case "intro-aero-ae":
    case "eng-mech-ae":
    case "math1-mg":
    case "stats1-mg":
    case "ct-mg":
    case "eng1-mg":
    case "econ-mg":
    case "fin-acc-mg":
    case "bus-stats-mg":
    case "mtp-mg":
      baseScore = Math.max(
        0.6 * values.F + 0.3 * Math.max(values.Qz1, values.Qz2),
        0.45 * values.F + 0.25 * values.Qz1 + 0.3 * values.Qz2,
      )
      break

    // Aeronautics - C Programming & Math for Elec II
    case "c-prog-ae":
      return (
        0.25 * values.Qz1 +
        0.45 * values.F +
        Math.max(0.15 * (values.OPPE1 || 0) + 0.15 * (values.OPPE2 || 0), 0.2 * Math.max(values.OPPE1 || 0, values.OPPE2 || 0))
      )

    case "math-elec2-ae":
      return (
        0.1 * values.GAA +
        Math.max(
          0.6 * values.F + 0.2 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.2 * values.Qz1 + 0.3 * values.Qz2,
        )
      )

    // Management - Diploma Level Standard Courses
    case "py-da-mg":
    case "data-mgmt-mg":
    case "econ-data-mg":
    case "mkt-analytics-mg":
    case "hr-analytics-mg":
    case "fin-analytics-mg":
    case "ops-mgmt-mg":
    case "sc-analytics-mg":
    case "corp-fin-mg":
    case "org-behav-mg":
    case "money-bank-mg":
    case "mkt-mgmt-mg":
    case "macro-econ-mg":
    case "mgr-econ-mg":
      return (
        0.05 * values.GAA +
        Math.max(
          0.6 * values.F + 0.25 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.25 * values.Qz1 + 0.3 * values.Qz2,
        )
      )

    // Management - Projects
    case "bm-proj-mg":
    case "ba-proj-mg":
      return 0.5 * (values.Report || 0) + 0.5 * (values.F || 0)

    // Management - Degree Level Standard Courses
    case "spg-mg":
    case "genai-bus-mg":
    case "digi-bus-mg":
    case "scm-mg":
    case "ts-analysis-mg":
    case "mkt-intel-mg":
    case "game-theory-mg":
    case "pub-fin-mg":
    case "econ-ai-mg":
    case "ind-org-mg":
    case "res-design-mg":
    case "proj-fin-mg":
    case "corp-val-mg":
    case "fin-forensics-mg":
    case "alm-risk-mg":
    case "cap-markets-mg":
    case "digi-mkt-mg":
    case "brand-mgmt-mg":
    case "consumer-behav-mg":
    case "design-think-mg":
    case "comp-opt-mg":
    case "bus-res-mg":
    case "sust-bus-mg":
    case "digi-strat-mg":
    case "fam-bus-mg":
    case "soc-media-mg":
    case "perf-mgmt-mg":
    case "resp-ai-mg":
      return (
        0.1 * values.GAA +
        Math.max(
          0.6 * values.F + 0.2 * Math.max(values.Qz1, values.Qz2),
          0.4 * values.F + 0.2 * values.Qz1 + 0.3 * values.Qz2,
        )
      )

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
  const bonus = values.Bonus || values.Extra || 0
  if (baseScore >= 40 && bonus > 0) {
    baseScore = Math.min(baseScore + bonus, 100)
  }

  return baseScore
}
