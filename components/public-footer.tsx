import Link from "next/link"
import { Music } from "lucide-react"

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Music className="h-5 w-5 text-accent" />
              <span className="font-serif text-lg font-semibold">ABA Music Studio</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Professional piano instruction for students of all ages and skill levels.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                About
              </Link>
              <Link href="/lessons" className="text-sm text-muted-foreground hover:text-foreground">
                Lessons & Pricing
              </Link>
              <Link href="/services" className="text-sm text-muted-foreground hover:text-foreground">
                Services
              </Link>
              <Link href="/policies" className="text-sm text-muted-foreground hover:text-foreground">
                Policies
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Students</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/inquire" className="text-sm text-muted-foreground hover:text-foreground">
                Inquire About Lessons
              </Link>
              <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
                Login
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact Us
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Contact</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Email: hello@abamusicstudio.com</p>
              <p>Phone: (555) 123-4567</p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ABA Music Studio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
