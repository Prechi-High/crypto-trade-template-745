import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Plus, ExternalLink, LogOut, DollarSign, TrendingUp } from "lucide-react";
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

const Admin = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    totalBalance: "",
    investedAmount: "",
    profitAmount: "",
    creditScore: "660"
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;
      setAdminProfile(data);
    } catch (error: any) {
      console.error('Error fetching admin profile:', error);
    }
  };

  const fetchUsers = async () => {
    try {
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

  const createUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          username: formData.username,
          totalBalance: formData.totalBalance,
          investedAmount: formData.investedAmount,
          profitAmount: formData.profitAmount,
          creditScore: formData.creditScore
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to create user');
      }

      toast({
        title: "Success",
        description: "User created successfully"
      });

      setShowCreateModal(false);
      setFormData({
        fullName: "",
        email: "",
        username: "",
        password: "",
        totalBalance: "",
        investedAmount: "",
        profitAmount: "",
        creditScore: "660"
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateFinancials = async () => {
    if (!selectedUser) return;

    try {
      await supabase
        .from('user_financials')
        .update({
          total_balance: parseFloat(formData.totalBalance),
          invested_amount: parseFloat(formData.investedAmount),
          profit_amount: parseFloat(formData.profitAmount),
          credit_score: parseInt(formData.creditScore)
        })
        .eq('user_profile_id', selectedUser.id);

      toast({
        title: "Success",
        description: "Financial data updated successfully"
      });

      setShowEditModal(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const openEditModal = (user: UserProfile) => {
    setSelectedUser(user);
    const financials = user.user_financials[0] || {
      total_balance: 0,
      invested_amount: 0,
      profit_amount: 0,
      credit_score: 660
    };
    setFormData({
      fullName: user.full_name,
      email: user.email,
      username: user.username || "",
      password: "",
      totalBalance: financials.total_balance.toString(),
      investedAmount: financials.invested_amount.toString(),
      profitAmount: financials.profit_amount.toString(),
      creditScore: financials.credit_score.toString()
    });
    setShowEditModal(true);
  };

  const copyShareLink = (shareToken: string) => {
    const shareUrl = `${window.location.origin}/shared/${shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Share link copied",
      description: "The share link has been copied to your clipboard"
    });
  };

  const copyReferralLink = () => {
    if (!adminProfile) return;
    const referralUrl = `${window.location.origin}/auth?ref=${adminProfile.id}`;
    navigator.clipboard.writeText(referralUrl);
    toast({
      title: "Referral link copied",
      description: "Your broker referral link has been copied to your clipboard"
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-foreground">
      <Navigation />
      
      <div className="container px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <div className="flex gap-4">
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button className="bg-primary/20 text-primary border border-primary/30">
                  <Plus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent className="glass">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({...prev, fullName: e.target.value}))}
                      className="glass"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                      className="glass"
                    />
                  </div>
                  <div>
                    <Label>Username</Label>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                      className="glass"
                    />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                      className="glass"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Total Balance</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.totalBalance}
                        onChange={(e) => setFormData(prev => ({...prev, totalBalance: e.target.value}))}
                        className="glass"
                      />
                    </div>
                    <div>
                      <Label>Invested Amount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.investedAmount}
                        onChange={(e) => setFormData(prev => ({...prev, investedAmount: e.target.value}))}
                        className="glass"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Profit Amount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.profitAmount}
                        onChange={(e) => setFormData(prev => ({...prev, profitAmount: e.target.value}))}
                        className="glass"
                      />
                    </div>
                    <div>
                      <Label>Credit Score</Label>
                      <Input
                        type="number"
                        value={formData.creditScore}
                        onChange={(e) => setFormData(prev => ({...prev, creditScore: e.target.value}))}
                        className="glass"
                      />
                    </div>
                  </div>
                  <Button onClick={createUser} className="w-full">
                    Create User
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={handleLogout} className="glass">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </motion.div>

        {adminProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Your Broker Referral Link
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label>Share this link to refer new users:</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        readOnly
                        value={`${window.location.origin}/auth?ref=${adminProfile.id}`}
                        className="glass"
                      />
                      <Button onClick={copyReferralLink} variant="outline" className="glass">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Users who sign up with this link will appear in your dashboard and you can manage their financial data.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Card className="glass">
          <CardHeader>
            <CardTitle>Your Referred Users</CardTitle>
          </CardHeader>
          <CardContent>
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
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(user)}
                            className="glass"
                          >
                            <DollarSign className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyShareLink(user.share_token)}
                            className="glass"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>Edit Financial Data - {selectedUser?.full_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Balance</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.totalBalance}
                    onChange={(e) => setFormData(prev => ({...prev, totalBalance: e.target.value}))}
                    className="glass"
                  />
                </div>
                <div>
                  <Label>Invested Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.investedAmount}
                    onChange={(e) => setFormData(prev => ({...prev, investedAmount: e.target.value}))}
                    className="glass"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Profit Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.profitAmount}
                    onChange={(e) => setFormData(prev => ({...prev, profitAmount: e.target.value}))}
                    className="glass"
                  />
                </div>
                <div>
                  <Label>Credit Score</Label>
                  <Input
                    type="number"
                    value={formData.creditScore}
                    onChange={(e) => setFormData(prev => ({...prev, creditScore: e.target.value}))}
                    className="glass"
                  />
                </div>
              </div>
              <Button onClick={updateFinancials} className="w-full">
                Update Financial Data
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;