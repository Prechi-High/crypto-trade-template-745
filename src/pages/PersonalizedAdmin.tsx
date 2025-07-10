import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ExternalLink, DollarSign, Users, TrendingUp, Copy } from "lucide-react";
import Navigation from "@/components/Navigation";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  username: string;
  share_token: string;
  created_at: string;
  user_financials: {
    total_balance: number;
    invested_amount: number;
    profit_amount: number;
    credit_score: number;
  }[];
}

interface AdminProfile {
  id: string;
  full_name: string;
  email: string;
  share_token: string;
}

const PersonalizedAdmin = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        window.location.href = '/auth';
        return;
      }

      setCurrentUser(session.user);
      await fetchAdminProfile();
      await fetchReferredUsers();
    };

    checkAuth();
  }, [shareToken]);

  const fetchAdminProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, share_token')
        .eq('share_token', shareToken)
        .single();

      if (error) throw error;
      setAdminProfile(data);
    } catch (error: any) {
      console.error('Error fetching admin profile:', error);
      toast({
        title: "Error",
        description: "Admin profile not found",
        variant: "destructive"
      });
    }
  };

  const fetchReferredUsers = async () => {
    try {
      if (!shareToken) return;

      // First get the admin profile ID from the share token
      const { data: adminData, error: adminError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('share_token', shareToken)
        .single();

      if (adminError) throw adminError;

      // Then get users referred by this admin
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_financials (
            total_balance,
            invested_amount,
            profit_amount,
            credit_score
          )
        `)
        .eq('referred_by', adminData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = (userShareToken: string) => {
    const shareUrl = `${window.location.origin}/shared/${userShareToken}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Share link copied",
      description: "The user's dashboard share link has been copied to your clipboard"
    });
  };

  const copyReferralLink = () => {
    if (!adminProfile) return;
    const referralUrl = `${window.location.origin}/auth?ref=${adminProfile.id}`;
    navigator.clipboard.writeText(referralUrl);
    toast({
      title: "Referral link copied",
      description: "Your referral link has been copied to your clipboard"
    });
  };

  const copyAdminLink = () => {
    if (!adminProfile) return;
    const adminUrl = `${window.location.origin}/admin/${adminProfile.share_token}`;
    navigator.clipboard.writeText(adminUrl);
    toast({
      title: "Admin link copied",
      description: "Your personalized admin link has been copied to your clipboard"
    });
  };

  const calculateTotals = () => {
    const totals = users.reduce((acc, user) => {
      const financials = user.user_financials[0] || {
        total_balance: 0,
        invested_amount: 0,
        profit_amount: 0,
        credit_score: 660
      };
      
      acc.totalBalance += financials.total_balance;
      acc.totalInvested += financials.invested_amount;
      acc.totalProfit += financials.profit_amount;
      return acc;
    }, { totalBalance: 0, totalInvested: 0, totalProfit: 0 });

    return totals;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!adminProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Admin profile not found</div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-black text-foreground">
      <Navigation />
      
      <div className="container px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            {adminProfile.full_name}'s Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Managing {users.length} referred users</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                  <p className="text-2xl font-bold">${totals.totalBalance.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <p className="text-2xl font-bold">${totals.totalInvested.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Profit</p>
                  <p className="text-2xl font-bold text-green-400">${totals.totalProfit.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Referral Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Referral Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Share this link to recruit new users:
              </p>
              <div className="flex gap-2">
                <div className="flex-1 p-2 bg-background/50 rounded text-xs font-mono break-all">
                  {`${window.location.origin}/auth?ref=${adminProfile.id}`}
                </div>
                <Button onClick={copyReferralLink} size="sm" variant="outline" className="glass">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Admin Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Your personalized admin dashboard:
              </p>
              <div className="flex gap-2">
                <div className="flex-1 p-2 bg-background/50 rounded text-xs font-mono break-all">
                  {`${window.location.origin}/admin/${adminProfile.share_token}`}
                </div>
                <Button onClick={copyAdminLink} size="sm" variant="outline" className="glass">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle>Your Referred Users</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No users referred yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Share your referral link to get started!
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Invested</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead>Credit Score</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      const financials = user.user_financials[0] || {
                        total_balance: 0,
                        invested_amount: 0,
                        profit_amount: 0,
                        credit_score: 660
                      };
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.full_name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.username || '-'}</TableCell>
                          <TableCell>${financials.total_balance.toLocaleString()}</TableCell>
                          <TableCell>${financials.invested_amount.toLocaleString()}</TableCell>
                          <TableCell className="text-green-400">
                            ${financials.profit_amount.toLocaleString()}
                          </TableCell>
                          <TableCell>{financials.credit_score}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyShareLink(user.share_token)}
                              className="glass"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PersonalizedAdmin;