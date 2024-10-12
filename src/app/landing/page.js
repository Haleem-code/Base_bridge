"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Send, Calculator, Clock, LogOut, Settings, Wallet } from "lucide-react"

export default function MainApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("Anon")
  const [userAvatar, setUserAvatar] = useState("/placeholder.svg?height=40&width=40")
  const [walletAddress, setWalletAddress] = useState("")
  const [ethBalance, setEthBalance] = useState("")
  const [fiatBalance, setFiatBalance] = useState("10000.00") // Mock fiat balance
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [provider, setProvider] = useState(null)
  const [error, setError] = useState(null)
  const [ethToNgnRate, setEthToNgnRate] = useState(null)
  const [transferType, setTransferType] = useState("crypto")

  useEffect(() => {
    const initializeProvider = async () => {
      if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
        try {
          await new Promise((resolve) => {
            if (window.ethereum) {
              resolve()
            } else {
              window.addEventListener("ethereum#initialized", resolve, { once: true })
              setTimeout(resolve, 3000)
            }
          })

          if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum)
            setProvider(provider)
          } else {
            setError("Ethereum provider not found. Please install MetaMask.")
          }
        } catch (error) {
          console.error("Error initializing provider:", error)
          setError("Failed to initialize Ethereum provider. Please make sure MetaMask is installed and unlocked.")
        }
      }
    }

    initializeProvider()
    fetchEthToNgnRate()
  }, [])

  const fetchEthToNgnRate = async () => {
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=ngn")
      const data = await response.json()
      setEthToNgnRate(data.ethereum.ngn)
    } catch (error) {
      console.error("Error fetching ETH to NGN rate:", error)
      setError("Failed to fetch conversion rate.")
    }
  }

  const handleGoogleSignIn = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setIsWalletConnected(false)
    setWalletAddress("")
    setEthBalance("")
  }

  const handleConnectWallet = async () => {
    if (provider) {
      try {
        const accounts = await provider.send("eth_requestAccounts", [])
        const address = accounts[0]
        setWalletAddress(address)

        const balance = await provider.getBalance(address)
        const ethBalance = ethers.formatEther(balance)
        setEthBalance(parseFloat(ethBalance).toFixed(4))

        setIsWalletConnected(true)
        setError(null)
      } catch (error) {
        console.error("Failed to connect wallet:", error)
        setError("Failed to connect wallet. Please make sure MetaMask is unlocked and try again.")
      }
    } else {
      setError("Ethereum provider not available. Please make sure MetaMask is installed and refresh the page.")
    }
  }

  const handleTransfer = async (recipient, amount) => {
    if (transferType === "crypto") {
      if (!isWalletConnected) {
        setError("Please connect your wallet to proceed with the crypto transfer.")
        return
      }

      if (!ethers.isAddress(recipient)) {
        setError("Invalid recipient address.")
        return
      }

      try {
        const signer = await provider.getSigner()
        const tx = await signer.sendTransaction({
          to: recipient,
          value: ethers.parseEther(amount),
        })

        await tx.wait()
        setError(null)
        alert(`Crypto transfer of ${amount} ETH to ${recipient} successful!`)
      } catch (error) {
        console.error("Crypto transfer failed:", error)
        setError("Crypto transfer failed. Please try again.")
      }
    } else {
      // Simulate fiat transfer
      setTimeout(() => {
        alert(`Fiat transfer of ${amount} NGN to ${recipient} successful!`)
      }, 1000)
    }
  }

  const handleConvert = (amount) => {
    if (ethToNgnRate) {
      const convertedAmount = transferType === "crypto" 
        ? (amount * ethToNgnRate).toFixed(2) 
        : (amount / ethToNgnRate).toFixed(6)
      return convertedAmount
    }
    return "N/A"
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
        <Card className="w-[350px]">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Basebridge</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGoogleSignIn} className="w-full bg-blue-500 hover:bg-blue-600">
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 p-4">
      <div className="max-w-md mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-white">{userName}</h2>
              <p className="text-sm text-blue-200">Sepolia Testnet</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-white">
            <LogOut className="h-5 w-5" />
          </Button>
        </header>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-blue-700 text-white">
            <CardContent className="pt-6">
              <Wallet className="h-8 w-8 mb-2" />
              <h3 className="text-lg font-semibold mb-1">Crypto Wallet</h3>
              {isWalletConnected ? (
                <>
                  <p className="text-sm mb-1">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
                  <p className="text-2xl font-bold">{ethBalance} ETH</p>
                </>
              ) : (
                <Button onClick={handleConnectWallet} className="w-full mt-2 bg-blue-500 hover:bg-blue-600">
                  Connect Wallet
                </Button>
              )}
            </CardContent>
          </Card>
          <Card className="bg-green-600 text-white">
            <CardContent className="pt-6">
              <Wallet className="h-8 w-8 mb-2" />
              <h3 className="text-lg font-semibold mb-1">Fiat Account</h3>
              <p className="text-2xl font-bold">{fiatBalance} NGN</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-around mb-6">
          <Button 
            variant={transferType === "crypto" ? "default" : "outline"} 
            onClick={() => setTransferType("crypto")}
            className={transferType === "crypto" ? "bg-blue-500 text-white" : "text-black border-blue-200"}
          >
            Crypto
          </Button>
          <Button 
            variant={transferType === "fiat" ? "default" : "outline"} 
            onClick={() => setTransferType("fiat")}
            className={transferType === "fiat" ? "bg-green-500 text-white" : "text-black border-green-200"}
          >
            Fiat
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-24 flex flex-col items-center justify-center bg-blue-500 hover:bg-blue-600">
                <Send className="h-8 w-8 mb-2" />
                Transfer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transfer {transferType === "crypto" ? "Crypto" : "Fiat"}</DialogTitle>
                <DialogDescription>
                  Send {transferType === "crypto" ? "ETH" : "NGN"} to another address.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Address</Label>
                  <Input id="recipient" placeholder={transferType === "crypto" ? "0x..." : "Account number"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ({transferType === "crypto" ? "ETH" : "NGN"})</Label>
                  <Input id="amount" type="number" step="0.0001" min="0" />
                </div>
                <Button className="w-full" onClick={() => {
                  const recipient = document.getElementById("recipient").value
                  const amount = document.getElementById("amount").value
                  handleTransfer(recipient, amount)
                }}>
                  Send {transferType === "crypto" ? "Crypto" : "Fiat"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-24 flex flex-col items-center justify-center bg-blue-500 hover:bg-blue-600">
                <Calculator className="h-8 w-8 mb-2" />
                Convert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convert {transferType === "crypto" ? "ETH to NGN" : "NGN to ETH"}</DialogTitle>
                <DialogDescription>Check the current conversion rate.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="convert-amount">{transferType === "crypto" ? "ETH Amount" : "NGN Amount"}</Label>
                  <Input id="convert-amount" type="number" step="0.0001" min="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="converted-amount">{transferType === "crypto" ? "NGN Amount" : "ETH Amount"}</Label>
                  <Input id="converted-amount" type="number" readOnly />
                </div>
                <Button className="w-full" onClick={() => {
                  const amount = document.getElementById("convert-amount").value
                  const convertedAmount = handleConvert(amount)
                  document.getElementById("converted-amount").value = convertedAmount
                }}>
                  Calculate
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-24 flex flex-col items-center justify-center bg-blue-500 hover:bg-blue-600">
                <Clock className="h-8 w-8 mb-2" />
                History
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transaction History</DialogTitle>
                <DialogDescription>Review your past transactions.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p>Transaction history will be displayed here.</p>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-24 flex flex-col items-center justify-center bg-blue-500 hover:bg-blue-600">
                <Settings className="h-8 w-8 mb-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
                <DialogDescription>Manage your account and preferences.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={userName} onChange={(e) => setUserName(e.target.value)} />
                </div>
                <Button className="w-full">Save Settings</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}