export const courseSyllabusData: Record<string, any> = {
  "qualifier-math-1": {
    title: "Mathematics for Data Science I",
    level: "qualifier",
    price: 499, originalPrice: 599,
    description: "Fundamental mathematics concepts for data science",
    thumbnail: "/courses/mathematics_for_datascience_1.jpeg",
    syllabus: [
      { week: 1, title: "Set Theory - Number system, Sets and their operations", topics: "Relations and functions - Relations and their types, Functions and their types" },
      { week: 2, title: "Rectangular coordinate system, Straight Lines", topics: "Slope of a line, Parallel and perpendicular lines, Representations of a Line, General equations of a line, Straight-line fit" },
      { week: 3, title: "Quadratic Functions", topics: "Quadratic functions, Minima, maxima, vertex, and slope, Quadratic Equations" },
      { week: 4, title: "Algebra of Polynomials", topics: "Addition, subtraction, multiplication, and division, Algorithms, Graphs of Polynomials - X-intercepts, multiplicities, end behavior, and turning points, Graphing & polynomial creation" }
    ]
  },
  "qualifier-stats-1": {
    title: "Statistics for Data Science I",
    level: "qualifier",
    price: 499, originalPrice: 599,
    description: "Introduction to statistical thinking and analysis",
    thumbnail: "/courses/statistics_for_datascience_1.jpeg",
    syllabus: [
      { week: 1, title: "Introduction and type of data", topics: "Types of data, Descriptive and Inferential statistics, Scales of measurement" },
      { week: 2, title: "Describing categorical data", topics: "Frequency distribution of categorical data, Best practices for graphing categorical data, Mode and median for categorical variable" },
      { week: 3, title: "Describing numerical data", topics: "Frequency tables for numerical data, Measures of central tendency - Mean, median and mode, Quartiles and percentiles, Measures of dispersion - Range, variance, standard deviation and IQR, Five number summary" },
      { week: 4, title: "Association between two variables", topics: "Association between two categorical variables - Using relative frequencies in contingency tables, Association between two numerical variables - Scatterplot, covariance, Pearson correlation coefficient, Point bi-serial correlation coefficient" }
    ]
  },
  "qualifier-computational-thinking": {
    title: "Computational Thinking",
    level: "qualifier",
    price: 499, originalPrice: 599,
    description: "Problem-solving and algorithmic thinking fundamentals",
    thumbnail: "/courses/ct.jpeg",
    syllabus: [
      { week: 1, title: "Variables, Initialization, Iterators, Filtering", topics: "Datatypes, Flowcharts, Sanity of data" },
      { week: 2, title: "Iteration, Filtering, Selection", topics: "Pseudocode, Finding max and min, AND operator" },
      { week: 3, title: "Multiple iterations (non-nested)", topics: "Three prizes problem, Procedures, Parameters, Side effects, OR operator" },
      { week: 4, title: "Nested iterations", topics: "Birthday paradox, Binning" }
    ]
  },
  "qualifier-english-1": {
    title: "English I",
    level: "qualifier",
    price: 499, originalPrice: 599,
    description: "Build core spoken and written English skills for IITM BS.",
    thumbnail: "/courses/english_for_datascience_1.jpeg",
    syllabus: [
      { week: 1, title: "Sounds and Words", topics: "Vowel and consonant sounds" },
      { week: 2, title: "Parts of Speech", topics: "Nouns, pronouns, verbs, adjectives, adverbs and usage" },
      { week: 3, title: "Sentences", topics: "Phrases and idioms" },
      { week: 4, title: "Speaking Skills", topics: "Spoken English preliminaries" }
    ]
  },
  "qualifier-python": {
    title: "Programming in Python",
    level: "qualifier",
    price: 499, originalPrice: 599,
    description: "Learn Python from scratch and build real-world applications.",
    thumbnail: "/courses/programming_in_python.jpeg",
    syllabus: [
      { week: 1, title: "Introduction to Python", topics: "Variables, Data Types, Input/Output, Operators" },
      { week: 2, title: "Control Flow", topics: "If-Else statements, For loops, While loops" },
      { week: 3, title: "Data Structures", topics: "Lists, Tuples, Dictionaries, Sets" },
      { week: 4, title: "Functions and Modules", topics: "Defining functions, scope, importing modules" }
    ]
  },
  "qualifier-java": {
    title: "Programming in Java",
    level: "qualifier",
    price: 499, originalPrice: 599,
    description: "Master Object Oriented Programming principles with Java.",
    thumbnail: "/courses/programming_in_java.jpeg",
    syllabus: [
      { week: 1, title: "Java Basics", topics: "Syntax, Data types, Variables, Operators" },
      { week: 2, title: "Control Structures", topics: "Conditional statements, Loops, Switch cases" },
      { week: 3, title: "Object Oriented Programming", topics: "Classes, Objects, Methods, Constructors" },
      { week: 4, title: "Advanced OOP concepts", topics: "Inheritance, Polymorphism, Encapsulation, Abstraction" }
    ]
  },
  "foundation-stats-2": {
    title: "Statistics for Data Science II",
    level: "foundation",
    price: 499, originalPrice: 599,
    description: "Advanced probability distributions, sampling, point estimation, hypothesis testing, and regression analysis.",
    thumbnail: "/courses/statistics_for_datascience_2.jpeg",
    syllabus: [
      { week: 1, title: "Discrete & Continuous Probability Distributions", topics: "Uniform, Normal, Exponential, Binomial, and Poisson distributions, Random variables, Expectation and Variance" },
      { week: 2, title: "Sampling Distributions & Point Estimation", topics: "Central Limit Theorem (CLT), Chi-Square distribution, Student-t distribution, F-distribution, Properties of estimators" },
      { week: 3, title: "Confidence Intervals & Hypothesis Testing", topics: "One-sample and Two-sample Z-tests, t-tests, Proportion tests, Type I and Type II errors, p-values and Power of a test" },
      { week: 4, title: "ANOVA, Chi-Square Tests & Regression", topics: "One-way and Two-way ANOVA, Goodness-of-fit and Independence tests, Simple Linear Regression model and assumptions" }
    ]
  },
  "qualifier-bundle": {
    title: "Qualifier Bundle (All 4 Courses)",
    level: "qualifier",
    price: 1799, originalPrice: 1999,
    description: "Master Math, Statistics, Computational Thinking, and English.",
    thumbnail: "/courses/qualifier_bundle_4_courses.jpeg",
    syllabus: [
      { isCourseHeader: true, title: "Mathematics for Data Science I" },
      { week: 1, title: "Set Theory - Number system, Sets and their operations", topics: "Relations and functions - Relations and their types, Functions and their types" },
      { week: 2, title: "Rectangular coordinate system, Straight Lines", topics: "Slope of a line, Parallel and perpendicular lines, Representations of a Line, General equations of a line, Straight-line fit" },
      { week: 3, title: "Quadratic Functions", topics: "Quadratic functions, Minima, maxima, vertex, and slope, Quadratic Equations" },
      { week: 4, title: "Algebra of Polynomials", topics: "Addition, subtraction, multiplication, and division, Algorithms, Graphs of Polynomials - X-intercepts, multiplicities, end behavior, and turning points, Graphing & polynomial creation" },
      { isCourseHeader: true, title: "Statistics for Data Science I" },
      { week: 1, title: "Introduction and type of data", topics: "Types of data, Descriptive and Inferential statistics, Scales of measurement" },
      { week: 2, title: "Describing categorical data", topics: "Frequency distribution of categorical data, Best practices for graphing categorical data, Mode and median for categorical variable" },
      { week: 3, title: "Describing numerical data", topics: "Frequency tables for numerical data, Measures of central tendency - Mean, median and mode, Quartiles and percentiles, Measures of dispersion - Range, variance, standard deviation and IQR, Five number summary" },
      { week: 4, title: "Association between two variables", topics: "Association between two categorical variables - Using relative frequencies in contingency tables, Association between two numerical variables - Scatterplot, covariance, Pearson correlation coefficient, Point bi-serial correlation coefficient" },
      { isCourseHeader: true, title: "Computational Thinking" },
      { week: 1, title: "Variables, Initialization, Iterators, Filtering", topics: "Datatypes, Flowcharts, Sanity of data" },
      { week: 2, title: "Iteration, Filtering, Selection", topics: "Pseudocode, Finding max and min, AND operator" },
      { week: 3, title: "Multiple iterations (non-nested)", topics: "Three prizes problem, Procedures, Parameters, Side effects, OR operator" },
      { week: 4, title: "Nested iterations", topics: "Birthday paradox, Binning" },
      { isCourseHeader: true, title: "English I" },
      { week: 1, title: "Sounds and Words", topics: "Vowel and consonant sounds" },
      { week: 2, title: "Parts of Speech", topics: "Nouns, pronouns, verbs, adjectives, adverbs and usage" },
      { week: 3, title: "Sentences", topics: "Phrases and idioms" },
      { week: 4, title: "Speaking Skills", topics: "Spoken English preliminaries" }
    ]
  },
  "coding-bundle": {
    title: "Coding Bundle (Python + Java)",
    level: "qualifier",
    price: 999, originalPrice: 1199,
    description: "Master both Python and Java programming languages.",
    thumbnail: "/courses/coding-bundle.jpg",
    syllabus: [
      { isCourseHeader: true, title: "Programming in Python" },
      { week: 1, title: "Introduction to Python", topics: "Variables, Data Types, Input/Output, Operators" },
      { week: 2, title: "Control Flow", topics: "If-Else statements, For loops, While loops" },
      { week: 3, title: "Data Structures", topics: "Lists, Tuples, Dictionaries, Sets" },
      { week: 4, title: "Functions and Modules", topics: "Defining functions, scope, importing modules" },
      { isCourseHeader: true, title: "Programming in Java" },
      { week: 1, title: "Java Basics", topics: "Syntax, Data types, Variables, Operators" },
      { week: 2, title: "Control Structures", topics: "Conditional statements, Loops, Switch cases" },
      { week: 3, title: "Object Oriented Programming", topics: "Classes, Objects, Methods, Constructors" },
      { week: 4, title: "Advanced OOP concepts", topics: "Inheritance, Polymorphism, Encapsulation, Abstraction" }
    ]
  }
}
