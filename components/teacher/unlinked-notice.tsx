import { AdminCard, EmptyState, PageHeader } from "@/components/admin/ui"

/**
 * Shown when a teacher login has no active roster row. Without one there is no
 * "your students" to scope to, and RLS returns nothing — so say why rather than
 * rendering an empty studio (scripts/016_teacher_scoped_access.sql).
 */
export function UnlinkedNotice() {
  return (
    <div className="flex flex-col gap-7 px-5 pb-14 pt-9 md:px-10">
      <PageHeader title="Almost there" summary="Your login is waiting to be linked to the studio roster" />
      <AdminCard>
        <EmptyState title="No roster profile linked">
          This account is a teacher login, but no active teacher on the studio roster points to it yet. An administrator
          can link it from the Teachers page in the admin portal, and your students, lessons, and calendar will appear here.
        </EmptyState>
      </AdminCard>
    </div>
  )
}
