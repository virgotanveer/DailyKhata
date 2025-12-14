"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, TrendingUp, TrendingDown, Wallet, DollarSign, Download, FileSpreadsheet, FileText, Upload } from "lucide-react"

interface Transaction {
  id: string
  date: string
  description: string
  type: "cash-in" | "cash-out"
  category: "cash" | "online" | "expense"
  amount: number
}

export default function Home() {
  // Load data from localStorage on initial render with hydration-safe approach
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [openingBalance, setOpeningBalance] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage after component mounts
  useEffect(() => {
    try {
      const savedTransactions = localStorage.getItem('cashflow-transactions')
      const savedBalance = localStorage.getItem('cashflow-opening-balance')
      
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions))
      }
      
      if (savedBalance) {
        setOpeningBalance(parseFloat(savedBalance))
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])
  
  const [cashInOpen, setCashInOpen] = useState(false)
  const [cashOutOpen, setCashOutOpen] = useState(false)
  
  const [cashInForm, setCashInForm] = useState({
    description: "",
    category: "cash" as "cash" | "online",
    amount: ""
  })
  
  const [cashOutForm, setCashOutForm] = useState({
    description: "",
    amount: ""
  })

  const [restoreOpen, setRestoreOpen] = useState(false)
  const [restoreFile, setRestoreFile] = useState<File | null>(null)

  // Get unique descriptions for autocomplete suggestions
  const getUniqueDescriptions = (type: "cash-in" | "cash-out") => {
    const descriptions = transactions
      .filter(t => t.type === type)
      .map(t => t.description)
      .filter(Boolean)
    
    // Remove duplicates and keep last 5 unique descriptions
    return [...new Set(descriptions)].slice(-5)
  }

  const cashInSuggestions = getUniqueDescriptions("cash-in")
  const cashOutSuggestions = getUniqueDescriptions("cash-out")

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('cashflow-transactions', JSON.stringify(transactions))
      } catch (error) {
        console.error('Error saving transactions to localStorage:', error)
      }
    }
  }, [transactions, isLoaded])

  // Save opening balance to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('cashflow-opening-balance', openingBalance.toString())
      } catch (error) {
        console.error('Error saving opening balance to localStorage:', error)
      }
    }
  }, [openingBalance, isLoaded])

  const calculateTotals = () => {
    const cashSales = transactions
      .filter(t => t.type === "cash-in" && t.category === "cash")
      .reduce((sum, t) => sum + t.amount, 0)
    
    const onlineSales = transactions
      .filter(t => t.type === "cash-in" && t.category === "online")
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalSales = transactions
      .filter(t => t.type === "cash-in")
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalCashOut = transactions
      .filter(t => t.type === "cash-out")
      .reduce((sum, t) => sum + t.amount, 0)
    
    const netCashFlow = totalSales - totalCashOut
    const closingBalance = openingBalance + netCashFlow

    return {
      cashSales,
      onlineSales,
      totalSales,
      totalCashOut,
      netCashFlow,
      closingBalance
    }
  }

  const downloadCSV = () => {
    const totals = calculateTotals()
    const csvContent = [
      "Daily Cash Flow Report",
      `Date,${new Date().toLocaleDateString()}`,
      "",
      "Opening Balance," + openingBalance.toFixed(2),
      "",
      "Cash In Transactions",
      "Date,Description,Type,Amount (PKR)",
      ...transactions
        .filter(t => t.type === "cash-in")
        .map(t => `${t.date},"${t.description}",${t.category},${t.amount.toFixed(2)}`),
      "",
      "Cash Out Transactions", 
      "Date,Description,Amount (PKR)",
      ...transactions
        .filter(t => t.type === "cash-out")
        .map(t => `${t.date},"${t.description}",${t.amount.toFixed(2)}`),
      "",
      "Summary",
      "Cash Sales," + totals.cashSales.toFixed(2),
      "Online Sales," + totals.onlineSales.toFixed(2),
      "Total Sales," + totals.totalSales.toFixed(2),
      "Total Cash Out," + totals.totalCashOut.toFixed(2),
      "Net Cash Flow," + totals.netCashFlow.toFixed(2),
      "Closing Balance," + totals.closingBalance.toFixed(2)
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cash-flow-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const downloadJSON = () => {
    const totals = calculateTotals()
    const data = {
      reportDate: new Date().toISOString(),
      openingBalance,
      totals,
      transactions,
      summary: {
        cashSales: totals.cashSales,
        onlineSales: totals.onlineSales,
        totalSales: totals.totalSales,
        totalCashOut: totals.totalCashOut,
        netCashFlow: totals.netCashFlow,
        closingBalance: totals.closingBalance
      }
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cash-flow-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setTransactions([])
      setOpeningBalance(0)
      try {
        localStorage.removeItem('cashflow-transactions')
        localStorage.removeItem('cashflow-opening-balance')
      } catch (error) {
        console.error('Error clearing localStorage:', error)
      }
    }
  }

  const restoreFromJSON = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)
        
        if (data.openingBalance !== undefined) {
          setOpeningBalance(parseFloat(data.openingBalance))
        }
        
        if (data.transactions && Array.isArray(data.transactions)) {
          setTransactions(data.transactions)
        }
        
        setRestoreOpen(false)
        setRestoreFile(null)
        
        window.alert('Data restored successfully! Your transactions and opening balance have been loaded.')
      } catch (error) {
        window.alert('Error: Invalid JSON file. Please select a valid backup file.')
      }
    }
    reader.readAsText(file)
  }

  const restoreFromCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const lines = content.split('\n')
        
        let newOpeningBalance = 0
        const newTransactions: Transaction[] = []
        
        let currentSection = ''
        let headers: string[] = []
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim()
          
          if (line.includes('Opening Balance')) {
            const balanceLine = lines[i + 1]
            if (balanceLine && balanceLine.includes(',')) {
              const balance = parseFloat(balanceLine.split(',')[1])
              if (!isNaN(balance)) {
                newOpeningBalance = balance
              }
            }
          } else if (line === 'Cash In Transactions') {
            currentSection = 'cash-in'
            headers = lines[i + 1].split(',').map(h => h.trim())
            i += 1
          } else if (line === 'Cash Out Transactions') {
            currentSection = 'cash-out'
            headers = lines[i + 1].split(',').map(h => h.trim())
            i += 1
          } else if (currentSection && line && !line.includes('Date,Description') && !line.includes('Summary')) {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
            
            if (values.length >= 3) {
              const transaction: Transaction = {
                id: Date.now().toString() + Math.random(),
                date: values[0] || new Date().toLocaleDateString(),
                description: values[1] || '',
                type: currentSection as 'cash-in' | 'cash-out',
                category: currentSection === 'cash-in' ? (values[2] as 'cash' | 'online') : 'expense',
                amount: parseFloat(values[3] || values[2]) || 0
              }
              
              if (transaction.description && transaction.amount > 0) {
                newTransactions.push(transaction)
              }
            }
          }
        }
        
        setOpeningBalance(newOpeningBalance)
        setTransactions(newTransactions)
        setRestoreOpen(false)
        setRestoreFile(null)
        
        window.alert('Data restored successfully! Your transactions and opening balance have been loaded.')
      } catch (error) {
        window.alert('Error: Invalid CSV file. Please select a valid backup file.')
      }
    }
    reader.readAsText(file)
  }

  const handleRestore = () => {
    if (!restoreFile) {
      window.alert('Please select a backup file first.')
      return
    }
    
    const fileExtension = restoreFile.name.split('.').pop()?.toLowerCase()
    
    if (fileExtension === 'json') {
      restoreFromJSON(restoreFile)
    } else if (fileExtension === 'csv') {
      restoreFromCSV(restoreFile)
    } else {
      window.alert('Please select a JSON or CSV backup file.')
    }
  }

  const handleCashIn = () => {
    if (cashInForm.description && cashInForm.amount) {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        description: cashInForm.description,
        type: "cash-in",
        category: cashInForm.category,
        amount: parseFloat(cashInForm.amount)
      }
      setTransactions([...transactions, newTransaction])
      setCashInForm({ description: "", category: "cash", amount: "" })
      setCashInOpen(false)
    }
  }

  const handleCashOut = () => {
    if (cashOutForm.description && cashOutForm.amount) {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        description: cashOutForm.description,
        type: "cash-out",
        category: "expense",
        amount: parseFloat(cashOutForm.amount)
      }
      setTransactions([...transactions, newTransaction])
      setCashOutForm({ description: "", amount: "" })
      setCashOutOpen(false)
    }
  }

  const totals = calculateTotals()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">Daily Cash Flow Tracker</h1>
          <p className="text-slate-600">Manage your daily cash transactions with ease</p>
          <p className="text-sm text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Loading State */}
        {!isLoaded && (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-slate-600">Loading your cash flow data...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content - Only show after loaded */}
        {isLoaded && (
          <>
        {/* Opening Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Opening Balance
              <Badge variant="secondary" className="text-xs">
                💾 Saved Locally
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label htmlFor="opening-balance" className="text-sm font-medium">Set Opening Balance:</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">PKR</span>
                <Input
                  id="opening-balance"
                  type="number"
                  placeholder="0.00"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
                  className="pl-16 w-40"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dialog open={cashInOpen} onOpenChange={setCashInOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-16 text-lg bg-green-600 hover:bg-green-700">
                <Plus className="h-5 w-5 mr-2" />
                Add Cash In
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  Add Cash In Entry
                </DialogTitle>
                <DialogDescription>
                  Record your cash sales or online sales
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cash-in-description">Description</Label>
                  <Input
                    id="cash-in-description"
                    placeholder="e.g., Sales from customer"
                    value={cashInForm.description}
                    onChange={(e) => setCashInForm({...cashInForm, description: e.target.value})}
                    list="cash-in-suggestions"
                  />
                  <datalist id="cash-in-suggestions">
                    {cashInSuggestions.map((desc, index) => (
                      <option key={index} value={desc} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <Label htmlFor="cash-in-category">Payment Type</Label>
                  <Select value={cashInForm.category} onValueChange={(value: "cash" | "online") => setCashInForm({...cashInForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash Payment</SelectItem>
                      <SelectItem value="online">Online Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cash-in-amount">Amount (PKR)</Label>
                  <Input
                    id="cash-in-amount"
                    type="number"
                    placeholder="0.00"
                    value={cashInForm.amount}
                    onChange={(e) => setCashInForm({...cashInForm, amount: e.target.value})}
                  />
                </div>
                <Button onClick={handleCashIn} className="w-full bg-green-600 hover:bg-green-700">
                  Add Cash In Entry
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={cashOutOpen} onOpenChange={setCashOutOpen}>
            <DialogTrigger asChild>
              <Button size="lg" variant="destructive" className="h-16 text-lg">
                <Plus className="h-5 w-5 mr-2" />
                Add Cash Out
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <TrendingDown className="h-5 w-5" />
                  Add Cash Out Entry
                </DialogTitle>
                <DialogDescription>
                  Record your expenses or cash withdrawals
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cash-out-description">Description</Label>
                  <Input
                    id="cash-out-description"
                    placeholder="e.g., Office supplies"
                    value={cashOutForm.description}
                    onChange={(e) => setCashOutForm({...cashOutForm, description: e.target.value})}
                    list="cash-out-suggestions"
                  />
                  <datalist id="cash-out-suggestions">
                    {cashOutSuggestions.map((desc, index) => (
                      <option key={index} value={desc} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <Label htmlFor="cash-out-amount">Amount (PKR)</Label>
                  <Input
                    id="cash-out-amount"
                    type="number"
                    placeholder="0.00"
                    value={cashOutForm.amount}
                    onChange={(e) => setCashOutForm({...cashOutForm, amount: e.target.value})}
                  />
                </div>
                <Button onClick={handleCashOut} className="w-full bg-red-600 hover:bg-red-700">
                  Add Cash Out Entry
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">PKR {totals.cashSales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Physical cash payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">PKR {totals.onlineSales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Digital payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">PKR {totals.totalSales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All cash in transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cash Out</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">PKR {totals.totalCashOut.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All expenses and withdrawals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totals.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                PKR {totals.netCashFlow.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Total sales minus expenses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closing Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">PKR {totals.closingBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Opening balance plus net cash flow</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cash In Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <TrendingUp className="h-5 w-5" />
                Cash In Transactions
              </CardTitle>
              <CardDescription>
                {transactions.filter(t => t.type === "cash-in").length} entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions
                  .filter(t => t.type === "cash-in")
                  .reverse()
                  .map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex-1">
                        <p className="font-medium text-green-900">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-sm text-green-700">
                          <span>{transaction.date}</span>
                          <Badge variant="secondary" className="text-xs">
                            {transaction.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        +PKR {transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                {transactions.filter(t => t.type === "cash-in").length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No cash in entries yet.</p>
                    <p className="text-sm">Click 'Add Cash In' to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cash Out Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <TrendingDown className="h-5 w-5" />
                Cash Out Transactions
              </CardTitle>
              <CardDescription>
                {transactions.filter(t => t.type === "cash-out").length} entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions
                  .filter(t => t.type === "cash-out")
                  .reverse()
                  .map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex-1">
                        <p className="font-medium text-red-900">{transaction.description}</p>
                        <p className="text-sm text-red-700">{transaction.date}</p>
                      </div>
                      <div className="text-lg font-bold text-red-600">
                        -PKR {transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                {transactions.filter(t => t.type === "cash-out").length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No cash out entries yet.</p>
                    <p className="text-sm">Click 'Add Cash Out' to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export/Import Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Export your data for backup or import previous records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button onClick={downloadCSV} variant="outline" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Download CSV
              </Button>
              <Button onClick={downloadJSON} variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Download JSON
              </Button>
              <Dialog open={restoreOpen} onOpenChange={setRestoreOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Restore Data
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Restore Backup Data</DialogTitle>
                    <DialogDescription>
                      Select a CSV or JSON backup file to restore your transactions and opening balance.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="restore-file">Backup File</Label>
                      <Input
                        id="restore-file"
                        type="file"
                        accept=".csv,.json"
                        onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleRestore} className="flex-1">
                        Restore Data
                      </Button>
                      <Button variant="outline" onClick={() => setRestoreOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={clearAllData} variant="destructive" className="flex items-center gap-2">
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>
        </>
        )}
      </div>
    </div>
  )
}