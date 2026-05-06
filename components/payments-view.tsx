"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Receipt, CheckCircle, Clock, AlertCircle } from "lucide-react"
import type { Invoice } from "@/lib/types"
import Link from "next/link"

interface PaymentsViewProps {
  invoices: Invoice[]
  studentId?: string
}

export function PaymentsView({ invoices, studentId }: PaymentsViewProps) {
  const unpaidInvoices = invoices.filter((inv) => inv.status === "unpaid")
  const paidInvoices = invoices.filter((inv) => inv.status === "paid")
  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0)

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
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (!studentId) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">Complete your profile to view payment information.</p>
          <Button className="mt-4" asChild>
            <Link href="/portal/profile">Complete Profile</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Balance Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${totalUnpaid > 0 ? "text-destructive" : "text-green-600"}`}>
              ${(totalUnpaid / 100).toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              {unpaidInvoices.length} unpaid invoice{unpaidInvoices.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${(paidInvoices.reduce((sum, inv) => sum + inv.amount, 0) / 100).toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">Lifetime payments</p>
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

      {/* Unpaid Invoices */}
      {unpaidInvoices.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Outstanding Invoices
            </CardTitle>
            <CardDescription>Please pay these invoices at your earliest convenience.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unpaidInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{invoice.description || "Piano Lesson"}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "Upon receipt"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-bold">${(invoice.amount / 100).toFixed(2)}</p>
                    <Button asChild>
                      <Link href={`/portal/payments/${invoice.id}`}>Pay Now</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your past invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{invoice.description || "Piano Lesson"}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.created_at).toLocaleDateString()}
                        {invoice.paid_at && ` • Paid ${new Date(invoice.paid_at).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-medium">${(invoice.amount / 100).toFixed(2)}</p>
                    {getStatusBadge(invoice.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No invoices yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
