import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { UserRole } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Shield, ShieldAlert, ShieldCheck, UserCog, Users } from "lucide-react";

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

const Admin = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [newPermissionName, setNewPermissionName] = useState("");
  const [newPermissionDescription, setNewPermissionDescription] = useState("");

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
  }, [isAdmin, navigate]);

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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-10">
        <div className="flex items-center gap-2 mb-6">
          <UserCog className="h-6 w-6 text-diablo-500" />
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>User Management</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" />
              <span>Permissions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>
                  Manage user accounts and roles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-diablo-500"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell className="flex items-center gap-1">
                            {getRoleIcon(user.role)}
                            <span className="capitalize">{user.role}</span>
                          </TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {user.last_sign_in_at
                              ? new Date(user.last_sign_in_at).toLocaleDateString()
                              : "Never"}
                          </TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Change Role
                                </Button>
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
