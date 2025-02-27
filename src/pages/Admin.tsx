
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Activity, 
  BarChart3, 
  Globe, 
  ListFilter, 
  MoreHorizontal, 
  RefreshCw, 
  Search, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  User, 
  UserCog, 
  Users
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface UserWithProfile {
  id: string;
  email: string;
  username: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: UserRole;
}

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface SiteStats {
  totalUsers: number;
  activeUsers: number;
  trades: number;
  priceChecks: number;
  newUsersToday: number;
}

const Admin = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithProfile[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [newPermissionName, setNewPermissionName] = useState("");
  const [newPermissionDescription, setNewPermissionDescription] = useState("");
  const [siteStats, setSiteStats] = useState<SiteStats>({
    totalUsers: 0,
    activeUsers: 0,
    trades: 0,
    priceChecks: 0,
    newUsersToday: 0
  });

  useEffect(() => {
    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access this page."
      });
      navigate("/");
      return;
    }

    fetchUsers();
    fetchPermissions();
    fetchSiteStats();
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (users.length > 0) {
      filterUsers();
    }
  }, [userSearch, roleFilter, users]);

  const filterUsers = () => {
    let filtered = [...users];
    
    // Filter by search term
    if (userSearch) {
      const searchLower = userSearch.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchLower) || 
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(filtered);
  };

  const fetchSiteStats = async () => {
    setStatsLoading(true);
    try {
      // Get total users count
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Get active trades count
      const { count: tradesCount, error: tradesError } = await supabase
        .from('trades')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (tradesError) throw tradesError;

      // Get price checks count
      const { count: priceChecksCount, error: priceChecksError } = await supabase
        .from('price_checks')
        .select('*', { count: 'exact', head: true });

      if (priceChecksError) throw priceChecksError;

      // Get users created today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: newUsersToday, error: newUsersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      if (newUsersError) throw newUsersError;

      // Get active users (logged in within last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: activeUsers, error: activeUsersError } = await supabase
        .rpc('count_active_users', { days_ago: 7 });

      setSiteStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        trades: tradesCount || 0,
        priceChecks: priceChecksCount || 0,
        newUsersToday: newUsersToday || 0
      });
    } catch (error: any) {
      console.error("Error fetching site stats:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch site statistics: ${error.message}`
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: authUsers, error: authError } = await supabase
        .from('profiles')
        .select('id, username, created_at');

      if (authError) throw authError;

      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const { data: authDetails, error: detailsError } = await supabase
        .rpc('get_users_with_details');

      if (detailsError) {
        console.error("Error fetching user details:", detailsError);
        // Continue without details if this fails
      }

      const usersWithRoles = authUsers.map((profile: any) => {
        const roleInfo = userRoles.find((r: any) => r.user_id === profile.id);
        const userDetails = authDetails?.find((d: any) => d.id === profile.id) || {};
        
        return {
          id: profile.id,
          username: profile.username,
          email: userDetails.email || "No email available",
          created_at: profile.created_at,
          last_sign_in_at: userDetails.last_sign_in_at || null,
          role: roleInfo ? roleInfo.role : "user"
        };
      });

      setUsers(usersWithRoles);
      setFilteredUsers(usersWithRoles);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch users: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*');

      if (error) throw error;
      setPermissions(data || []);
    } catch (error: any) {
      console.error("Error fetching permissions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch permissions: ${error.message}`
      });
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUserId) return;

    try {
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', selectedUserId)
        .single();

      if (existingRole) {
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({ role: selectedRole })
          .eq('user_id', selectedUserId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: selectedUserId, role: selectedRole });

        if (insertError) throw insertError;
      }

      toast({
        title: "Role Updated",
        description: `User role has been updated to ${selectedRole}.`
      });

      fetchUsers();
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update role: ${error.message}`
      });
    }
  };

  const handleCreatePermission = async () => {
    if (!newPermissionName.trim()) return;

    try {
      const { error } = await supabase
        .from('permissions')
        .insert({
          name: newPermissionName.trim(),
          description: newPermissionDescription.trim()
        });

      if (error) throw error;

      toast({
        title: "Permission Created",
        description: "New permission has been created successfully."
      });

      setNewPermissionName("");
      setNewPermissionDescription("");
      fetchPermissions();
    } catch (error: any) {
      console.error("Error creating permission:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to create permission: ${error.message}`
      });
    }
  };

  const handleDeletePermission = async (permissionId: string) => {
    try {
      const { error } = await supabase
        .from('permissions')
        .delete()
        .eq('id', permissionId);

      if (error) throw error;

      toast({
        title: "Permission Deleted",
        description: "Permission has been deleted successfully."
      });

      fetchPermissions();
    } catch (error: any) {
      console.error("Error deleting permission:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete permission: ${error.message}`
      });
    }
  };

  const handleRolePermissionChange = async (permissionId: string, roleType: UserRole, granted: boolean) => {
    try {
      if (granted) {
        const { error } = await supabase
          .from('role_permissions')
          .insert({
            role: roleType,
            permission_id: permissionId
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role', roleType)
          .eq('permission_id', permissionId);

        if (error) throw error;
      }

      toast({
        title: "Permissions Updated",
        description: `${roleType} permissions have been updated.`
      });
    } catch (error: any) {
      console.error("Error updating role permissions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update permissions: ${error.message}`
      });
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case 'moderator':
        return <ShieldCheck className="h-4 w-4 text-yellow-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive" className="capitalize">{role}</Badge>;
      case 'moderator':
        // FIX: Changed from "warning" (which doesn't exist) to "secondary" with custom style
        return <Badge variant="secondary" className="bg-yellow-500 text-white capitalize">{role}</Badge>;
      default:
        return <Badge variant="secondary" className="capitalize">{role}</Badge>;
    }
  };

  const refreshData = () => {
    fetchUsers();
    fetchPermissions();
    fetchSiteStats();
    toast({
      title: "Data Refreshed",
      description: "Admin data has been refreshed."
    });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <UserCog className="h-6 w-6 text-diablo-500" />
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          </div>
          <Button variant="outline" onClick={refreshData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full md:w-auto md:flex grid-cols-3 h-auto gap-2">
            <TabsTrigger value="dashboard" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden md:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden md:inline">Permissions</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Content */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                    ) : (
                      siteStats.totalUsers
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{siteStats.newUsersToday} today
                  </p>
                </CardContent>
                <CardFooter className="pt-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                    ) : (
                      siteStats.activeUsers
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Past 7 days
                  </p>
                </CardContent>
                <CardFooter className="pt-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Trades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                    ) : (
                      siteStats.trades
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Marketplace listings
                  </p>
                </CardContent>
                <CardFooter className="pt-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Price Checks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                    ) : (
                      siteStats.priceChecks
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Community valuations
                  </p>
                </CardContent>
                <CardFooter className="pt-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardFooter>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Overview of recent user actions and system events.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>User Registration</TableCell>
                        <TableCell>john_doe</TableCell>
                        <TableCell>Today, 10:30 AM</TableCell>
                        <TableCell>New user signed up</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Item Listed</TableCell>
                        <TableCell>enchanted_mage</TableCell>
                        <TableCell>Today, 09:45 AM</TableCell>
                        <TableCell>Listed "Enigma Runeword" for trade</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Price Check</TableCell>
                        <TableCell>battle_warrior</TableCell>
                        <TableCell>Yesterday, 4:20 PM</TableCell>
                        <TableCell>Submitted price check for "Harlequin Crest"</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Content */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts and roles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-auto flex gap-2">
                    <div className="w-full md:w-[180px]">
                      <Select
                        value={roleFilter}
                        onValueChange={setRoleFilter}
                      >
                        <SelectTrigger>
                          <div className="flex items-center gap-2">
                            <ListFilter className="h-4 w-4" />
                            <SelectValue placeholder="Filter by role" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="secondary" size="icon" onClick={() => {
                      setUserSearch("");
                      setRoleFilter("all");
                    }}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-diablo-500"></div>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="hidden md:table-cell">Created</TableHead>
                          <TableHead className="hidden md:table-cell">Last Login</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">
                              {userSearch || roleFilter !== "all" ? 
                                "No users match your search criteria." : 
                                "No users found."}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  {user.username}
                                </div>
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                {getRoleBadge(user.role)}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {new Date(user.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {user.last_sign_in_at
                                  ? new Date(user.last_sign_in_at).toLocaleDateString()
                                  : "Never"}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                          Change Role
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Change User Role</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Update role for {user.username}
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <div className="py-4">
                                          <Label htmlFor="role">Select Role</Label>
                                          <Select
                                            onValueChange={(value) => setSelectedRole(value as UserRole)}
                                            defaultValue={user.role}
                                          >
                                            <SelectTrigger className="w-full">
                                              <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="admin">Admin</SelectItem>
                                              <SelectItem value="moderator">Moderator</SelectItem>
                                              <SelectItem value="user">User</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction 
                                            onClick={() => {
                                              setSelectedUserId(user.id);
                                              handleRoleChange();
                                            }}
                                          >
                                            Save
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">
                                      Suspend User
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Permission Management</CardTitle>
                <CardDescription>
                  Create and manage permissions that can be assigned to roles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Create New Permission</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="permissionName">Permission Name</Label>
                      <Input
                        id="permissionName"
                        value={newPermissionName}
                        onChange={(e) => setNewPermissionName(e.target.value)}
                        placeholder="e.g., view_trades, edit_prices"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="permissionDescription">Description</Label>
                      <Input
                        id="permissionDescription"
                        value={newPermissionDescription}
                        onChange={(e) => setNewPermissionDescription(e.target.value)}
                        placeholder="What this permission allows"
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreatePermission}>Create Permission</Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Existing Permissions</h3>
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Permission</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Admin</TableHead>
                          <TableHead>Moderator</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {permissions.map((permission) => (
                          <TableRow key={permission.id}>
                            <TableCell>{permission.name}</TableCell>
                            <TableCell>{permission.description}</TableCell>
                            <TableCell>
                              <input
                                type="checkbox"
                                defaultChecked={true}
                                onChange={(e) => 
                                  handleRolePermissionChange(permission.id, 'admin', e.target.checked)
                                }
                                className="h-4 w-4"
                              />
                            </TableCell>
                            <TableCell>
                              <input
                                type="checkbox"
                                defaultChecked={false}
                                onChange={(e) => 
                                  handleRolePermissionChange(permission.id, 'moderator', e.target.checked)
                                }
                                className="h-4 w-4"
                              />
                            </TableCell>
                            <TableCell>
                              <input
                                type="checkbox"
                                defaultChecked={false}
                                onChange={(e) => 
                                  handleRolePermissionChange(permission.id, 'user', e.target.checked)
                                }
                                className="h-4 w-4"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeletePermission(permission.id)}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {permissions.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">
                              No permissions created yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
