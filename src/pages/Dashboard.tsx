
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Download, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { ActiveCreditChart } from "@/components/dashboard/ActiveCreditChart";
import { CreditScoreCard } from "@/components/dashboard/CreditScoreCard";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [userFinancials, setUserFinancials] = useState<any>(null);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        window.location.href = '/auth';
        return;
      }

      // Check role first
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      // If admin, redirect to admin page
      if (roleData?.role === 'admin') {
        window.location.href = '/admin';
        return;
      }

      // User is regular user, set up dashboard
      setUser(session.user);

      // Fetch financials and transactions
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_financials (*),
          user_transactions (*)
        `)
        .eq('user_id', session.user.id)
        .single();

      if (profileData?.user_financials?.[0]) {
        setUserFinancials(profileData.user_financials[0]);
      }

      if (profileData?.user_transactions) {
        setUserTransactions(profileData.user_transactions.sort((a, b) => 
          new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
        ));
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'withdrawal': return '💸';
      case 'investment': return '📈';
      case 'profit': return '🎯';
      default: return '💳';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'text-green-400';
      case 'withdrawal': return 'text-red-400';
      case 'investment': return 'text-blue-400';
      case 'profit': return 'text-green-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-black text-foreground">
      <Navigation />
      
      <div className="container px-4 py-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Welcome back, {user?.user_metadata?.full_name || user?.email}
          </motion.h1>
          <p className="text-muted-foreground text-lg">Here's a look at your performance and analytics.</p>
          
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button variant="outline" className="glass">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Button>
            <Button className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
              <Plus className="w-4 h-4 mr-2" />
              Add new coin
            </Button>
          </div>
        </motion.div>

        {/* Total Balance - Main Attraction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <Card className="glass bg-gradient-to-r from-primary/10 to-primary/20 border-primary/30">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground text-lg mb-2">Total Portfolio Value</p>
              <h2 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
                ${userFinancials?.total_balance || '0.00'}
              </h2>
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-green-400 text-lg font-medium">+12.9% Overall Gain</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Investment Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 text-xl">$</span>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount Invested</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-white">${userFinancials?.invested_amount || '0.00'}</p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-muted-foreground">Investment Gain</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-green-400">${userFinancials?.profit_amount || '0.00'}</p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Credit Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Active credit</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                </CardHeader>
                <CardContent>
                  <ActiveCreditChart />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Credit Score and Bitcoin */}
          <div className="space-y-6">
            {/* Credit Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CreditScoreCard creditScore={userFinancials?.credit_score || 660} />
            </motion.div>

            {/* Bitcoin Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                        <span className="text-white font-bold">₿</span>
                      </div>
                      <div>
                        <p className="font-medium">Bitcoin</p>
                        <p className="text-sm text-muted-foreground">BTC</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Reward Rate</p>
                      <p className="text-2xl font-bold text-green-400">14.74%</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold">$52,291</p>
                    <p className="text-sm text-green-400">+0.25%</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {userTransactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>TYPE</TableHead>
                      <TableHead>DATE</TableHead>
                      <TableHead>AMOUNT</TableHead>
                      <TableHead>STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{getTransactionIcon(transaction.transaction_type)}</span>
                            <div>
                              <p className="font-medium capitalize">{transaction.transaction_type}</p>
                              {transaction.description && (
                                <p className="text-sm text-muted-foreground">{transaction.description}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(transaction.transaction_date).toLocaleDateString('en-US', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </TableCell>
                        <TableCell className={`font-medium ${getTransactionTypeColor(transaction.transaction_type)}`}>
                          {transaction.transaction_type === 'withdrawal' ? '-' : '+'}${Math.abs(transaction.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 capitalize">
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No transactions yet</p>
                  <p className="text-sm mt-2">Your transaction history will appear here once you make your first transaction.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
