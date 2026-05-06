"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CreditCard, Plus, Receipt, CheckCircle, Clock, DollarSign, Loader2 } from "lucide-react"
import type { Invoice, Student, Profile } from "@/lib/types"
import { createInvoice, markAsPaid } from "@/app/admin/payments/actions"
import { useRouter } from "next/navigation"

interface AdminPaymentsViewProps {
  invoices: (Invoice & { student: Student & { profile: Profile } })[]
  students: (Student & { profile: Profile })[]
}

export function AdminPaymentsView({ invoices, students }: AdminPaymentsViewProps) {
  const router = useRouter()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const unpaidInvoices = invoices.filter((inv) => inv.status === "unpaid")
  const paidInvoices = invoices.filter((inv) => inv.status === "paid")
  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalPaidThisMonth = paidInvoices
    .filter((inv) => {
      const paidDate = new Date(inv.paid_at || inv.created_at)
      const now = new Date()
      return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, inv) => sum + inv.amount, 0)

  async function handleAddInvoice(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    await createInvoice(formData)
    router.refresh()
    setIsLoading(false)
    setAddDialogOpen(false)
  }

  async function handleMarkPaid(invoiceId: string, method: "cash" | "check") {
    setIsLoading(true)
    await markAsPaid(invoiceId, method)
    router.refresh()
    setIsLoading(false)
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "paid":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="mr-1 h-3 w-3" />
            Paid
          </Badge>
        )
      case "unpaid":
        return (
          <Badge variant="destructive">
            <Clock className="mr-1 h-3 w-3" />
            Unpaid
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${totalUnpaid > 0 ? "text-destructive" : ""}`}>
              ${(totalUnpaid / 100).toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">{unpaidInvoices.length} unpaid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">${(totalPaidThisMonth / 100).toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{invoices.length}</p>
            <p className="text-sm text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAddInvoice}>
              <DialogHeader>
                <DialogTitle>Create Invoice</DialogTitle>
                <DialogDescription>Create a new invoice for a student</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="student_id">Student</Label>
                  <Select name="student_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.profile?.full_name || "Unknown"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (in dollars)</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" min="0" required placeholder="45.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="e.g., Piano lesson - January 15" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input id="due_date" name="due_date" type="date" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Invoice"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Unpaid Invoices */}
      {unpaidInvoices.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-destructive" />
              Unpaid Invoices
            </CardTitle>
            <CardDescription>Invoices awaiting payment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unpaidInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{invoice.student?.profile?.full_name || "Student"}</p>
                    <p className="text-sm text-muted-foreground">{invoice.description || "Invoice"}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "Upon receipt"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-bold">${(invoice.amount / 100).toFixed(2)}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleMarkPaid(invoice.id, "cash")}>
                        Cash
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleMarkPaid(invoice.id, "check")}>
                        Check
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>Complete invoice history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{invoice.student?.profile?.full_name || "Student"}</p>
                  <p className="text-sm text-muted-foreground">
                    {invoice.description || "Invoice"} • {new Date(invoice.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium">${(invoice.amount / 100).toFixed(2)}</p>
                  {getStatusBadge(invoice.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
