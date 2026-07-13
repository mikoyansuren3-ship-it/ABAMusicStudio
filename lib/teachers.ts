export type Teacher = {
  /** URL-safe id, also used as the React key */
  slug: string
  name: string
  /** Title shown under the name, e.g. "Founder & Piano Instructor" */
  role: string
  /** Subjects/instruments this teacher covers — drives the tag chips */
  subjects: string[]
  /** Path under /public. Use a real portrait when available. */
  image: string
  imageAlt: string
  bio: string
  /** Founder is featured first and labeled distinctly */
  isFounder?: boolean
  /** Only published teachers render on the public site. Keep scaffolds unpublished. */
  published?: boolean
}

// NOTE: Arpine's entry is real. The three new instructors below are scaffolds —
// replace the `TODO` name/bio and the placeholder `image` with real values,
// then set `published: true` to show them on /faculty.
export const teachers: Teacher[] = [
  {
    slug: "arpine",
    name: "Arpine",
    role: "Founder & Piano Instructor",
    subjects: ["Piano"],
    image: "/arpine-portrait.png",
    imageAlt: "Arpine, ABA Music Academy founder and piano teacher",
    isFounder: true,
    published: true,
    bio: "With over 10 years of teaching experience, Arpine has guided students of all ages through their musical journeys. She holds a PhD in Music and brings a deep foundation in classical training to every lesson — shaped in part by her time at the Aram Khachaturian Museum and Komitas State Conservatory in Armenia. An MTAC member, she stays actively involved in the local music education community.",
  },
  {
    slug: "piano-instructor",
    name: "TODO: Piano teacher name",
    role: "Piano Instructor",
    subjects: ["Piano"],
    image: "/placeholder-user.jpg",
    imageAlt: "ABA Music Academy piano teacher",
    bio: "TODO: Add this instructor's bio — background, training, teaching approach, and the levels/ages they work with.",
  },
  {
    slug: "vocal-instructor",
    name: "TODO: Vocal teacher name",
    role: "Vocal Instructor",
    subjects: ["Voice"],
    image: "/placeholder-user.jpg",
    imageAlt: "ABA Music Academy vocal teacher",
    bio: "TODO: Add this instructor's bio — background, training, teaching approach, and the levels/ages they work with.",
  },
  {
    slug: "violin-instructor",
    name: "TODO: Violin teacher name",
    role: "Violin Instructor",
    subjects: ["Violin"],
    image: "/placeholder-user.jpg",
    imageAlt: "ABA Music Academy violin teacher",
    bio: "TODO: Add this instructor's bio — background, training, teaching approach, and the levels/ages they work with.",
  },
]

/** Teachers that are ready to show publicly. */
export const publishedTeachers = teachers.filter((teacher) => teacher.published)
