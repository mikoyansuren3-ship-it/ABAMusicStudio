export type CredentialKind = "training" | "award" | "performance" | "masterclass"

export type TeacherCredential = {
  /** The distinction itself, e.g. "Grand Prix". Keep it to ~4 words. */
  title: string
  /** Who awarded it / where it happened. */
  detail?: string
  /** Optional year or span. */
  year?: string
  /** Drives the icon + label grouping in the credentials band. */
  kind: CredentialKind
}

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
  /**
   * Tailwind object-position class used when the portrait has to be cropped
   * (e.g. the landscape cards on program pages). Defaults to `object-top`.
   * Set it when a centered/top crop would cut the face.
   */
  imagePosition?: string
  /**
   * Optional tighter crop for the program pages' teacher section, where the
   * frame is a tall portrait and the teacher should fill it. Only needed when
   * `image` is a wide scene the subject does not dominate — object-cover cannot
   * zoom, so the close-up has to be a real derived asset. Falls back to
   * `image`; /faculty always uses `image`.
   */
  closeUp?: string
  bio: string
  /**
   * Discrete, checkable distinctions — the same facts the bio states in prose,
   * structured so they can be emitted as schema.org `award` on the Person node.
   * Keep the two in sync. The visible credentials band on the program pages is
   * curated separately (`Program.credentials` in lib/programs.ts), because its
   * groupings, tally, and pull-quote are per-page editorial decisions.
   */
  credentials?: TeacherCredential[]
  /** Founder is featured first and labeled distinctly */
  isFounder?: boolean
  /** Only published teachers render on the public site. Keep scaffolds unpublished. */
  published?: boolean
}

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
    slug: "valeria-boroda",
    name: "Valeria Boroda",
    role: "Piano Instructor",
    subjects: ["Piano"],
    image: "/teachers/valeria-boroda.jpg",
    imageAlt: "Valeria Boroda, piano teacher at ABA Music Academy",
    published: true,
    bio: "Valeria is an award-winning pianist with a higher music education and more than 10 years of experience. A member of an international musicians' association, she delivers personalized, inspiring lessons that foster a lifelong love for music.",
  },
  {
    slug: "marietta-galstyan",
    name: "Marietta Galstyan",
    role: "Voice Instructor",
    subjects: ["Voice"],
    image: "/teachers/marietta-galstyan.jpg",
    // The full frame is a wide stage shot in which she reads small; the program
    // page's portrait frame uses a head-and-shoulders crop of it instead.
    closeUp: "/teachers/marietta-galstyan-closeup.jpg",
    imageAlt: "Marietta Galstyan, voice teacher at ABA Music Academy, singing on stage",
    published: true,
    bio: "Marietta is a singer with an extensive international background who grew up in a deeply musical environment, singing and playing piano from early childhood. A music school graduate, she has performed from a young age at international competitions and festivals across Europe — including Hungary, Italy, France, and Bulgaria — consistently earning top prizes, with performances praised for their emotional depth, vocal precision, and stage presence. She has appeared at international concerts and charity events supporting children, and is known for her versatility and ability to adapt her voice across genres — experience she loves sharing with young singers.",
    // Every item below is already asserted by the bio above. If one changes,
    // change both — this feeds the Person JSON-LD (`award`). The visible
    // credentials band is curated per page in lib/programs.ts.
    credentials: [
      {
        kind: "training",
        title: "Music School Graduate",
        detail: "Singing and playing piano from early childhood",
      },
      {
        kind: "award",
        title: "Top Prizes",
        detail: "International competitions and festivals in Hungary, Italy, France, and Bulgaria",
      },
      {
        kind: "performance",
        title: "International Concerts",
        detail: "Including charity events supporting children",
      },
      {
        kind: "performance",
        title: "Across Genres",
        detail: "Praised for emotional depth, vocal precision, and stage presence",
      },
    ],
  },
  {
    slug: "asya-anisimova",
    name: "Asya Anisimova",
    role: "Violin Instructor",
    subjects: ["Violin"],
    image: "/teachers/asya-anisimova.jpg",
    imageAlt: "Asya Anisimova, violin teacher at ABA Music Academy, holding her violin",
    published: true,
    bio: "Asya is a violinist trained at the Tchaikovsky Specialized Music School in Yerevan, where she graduated with excellence under Professor Eduard Tadevosyan. A Grand Prix winner at the AGBU Discover Talents competition and a first-prize winner at the Charleston International Music Competition and the World Open Music Competition, she has performed as a soloist with the Armenian State Symphony Orchestra and the Sofia State Chamber Orchestra, and plays first violin with the Chapman University Orchestra. Her training includes masterclasses with artists such as Daniel Hope, Stella Chen, and Sergey Khachatryan.",
    // Every item below is already asserted by the bio above. If one changes,
    // change both — this feeds the Person JSON-LD (`award`). The visible
    // credentials band is curated per page in lib/programs.ts.
    credentials: [
      {
        kind: "training",
        title: "Graduated with Excellence",
        detail: "Tchaikovsky Specialized Music School, Yerevan — studio of Prof. Eduard Tadevosyan",
      },
      { kind: "award", title: "Grand Prix", detail: "AGBU Discover Talents Competition" },
      { kind: "award", title: "First Prize", detail: "Charleston International Music Competition" },
      { kind: "award", title: "First Prize", detail: "World Open Music Competition" },
      { kind: "performance", title: "Soloist", detail: "Armenian State Symphony Orchestra" },
      { kind: "performance", title: "Soloist", detail: "Sofia State Chamber Orchestra" },
      { kind: "performance", title: "First Violin", detail: "Chapman University Orchestra" },
      {
        kind: "masterclass",
        title: "Masterclasses",
        detail: "Daniel Hope, Stella Chen, and Sergey Khachatryan",
      },
    ],
  },
  {
    slug: "gohar-harutunyan",
    name: "Gohar Harutunyan",
    role: "Qanun Instructor",
    subjects: ["Qanun"],
    image: "/teachers/gohar-harutunyan.jpg",
    imageAlt: "Gohar Harutunyan, qanun teacher at ABA Music Academy, with her qanun",
    // Her face sits high in the frame; a plain top crop clips it on the
    // landscape program cards.
    imagePosition: "object-[center_18%]",
    published: true,
    bio: "Gohar holds a degree in music education and brings more than 25 years of experience as a qanun teacher and performer, with a specialty in working with children. For the past five years in the U.S., she has actively shared her love of music and Armenian culture through teaching and community performance.",
    // Every item below is already asserted by the bio above. If one changes,
    // change both — this feeds the Person JSON-LD (`award`). The visible
    // credentials band is curated per page in lib/programs.ts.
    credentials: [
      { kind: "training", title: "Degree in Music Education" },
      {
        kind: "performance",
        title: "25+ Years on the Qanun",
        detail: "Teaching and performing the Armenian zither",
      },
      {
        kind: "performance",
        title: "Community Performance",
        detail: "Sharing Armenian musical culture in the U.S.",
        year: "Past 5 years",
      },
    ],
  },
]

/** Teachers that are ready to show publicly. */
export const publishedTeachers = teachers.filter((teacher) => teacher.published)
