// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Badge } from "@/components/ui/badge";
// import { Textarea } from "@/components/ui/textarea";
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import Navigation from "@/components/Navigation";
// import { supabase } from "@/integrations/supabase/client";
// import { useToast } from "@/hooks/use-toast";
// import { User } from "@supabase/supabase-js";
// import { CheckCircle, XCircle, Users, FileText, Brain } from "lucide-react";

// const Admin = () => {
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const [user, setUser] = useState<User | null>(null);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [submissions, setSubmissions] = useState<any[]>([]);
//   const [users, setUsers] = useState<any[]>([]);
//   const [stats, setStats] = useState({ totalContent: 0, totalUsers: 0, pendingSubmissions: 0 });
//   const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
//   const [rejectionReason, setRejectionReason] = useState("");

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       if (!session?.user) {
//         navigate("/auth");
//         return;
//       }
//       setUser(session.user);
//       checkAdminStatus(session.user.id);
//     });

//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       if (!session?.user) {
//         navigate("/auth");
//       } else {
//         setUser(session.user);
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, [navigate]);

//   const checkAdminStatus = async (userId: string) => {
//     const { data } = await supabase
//       .from('user_roles')
//       .select('role')
//       .eq('user_id', userId)
//       .eq('role', 'admin')
//       .single();

//     if (data) {
//       setIsAdmin(true);
//       fetchAdminData();
//     } else {
//       toast({
//         title: "Access Denied",
//         description: "You don't have admin permissions.",
//         variant: "destructive",
//       });
//       navigate("/");
//     }
//   };

//   const fetchAdminData = async () => {
//     // Fetch submissions
//     const { data: submissionsData } = await supabase
//       .from('submissions')
//       .select('*, profiles(full_name), regions(name)')
//       .order('created_at', { ascending: false });
    
//     if (submissionsData) setSubmissions(submissionsData);

//     // Fetch users
//     const { data: profilesData } = await supabase
//       .from('profiles')
//       .select('*, user_roles(role)')
//       .order('created_at', { ascending: false });
    
//     if (profilesData) setUsers(profilesData);

//     // Fetch stats
//     const { count: contentCount } = await supabase
//       .from('cultural_content')
//       .select('*', { count: 'exact', head: true });
    
//     const { count: userCount } = await supabase
//       .from('profiles')
//       .select('*', { count: 'exact', head: true });
    
//     const { count: pendingCount } = await supabase
//       .from('submissions')
//       .select('*', { count: 'exact', head: true })
//       .eq('status', 'pending');

//     setStats({
//       totalContent: contentCount || 0,
//       totalUsers: userCount || 0,
//       pendingSubmissions: pendingCount || 0,
//     });
//   };

//   const handleApproveSubmission = async (submission: any) => {
//     try {
//       // Create cultural content from submission
//       const { error: contentError } = await supabase
//         .from('cultural_content')
//         .insert({
//           type: submission.type,
//           title: submission.title,
//           content: submission.content,
//           summary: submission.content.substring(0, 200),
//           author_name: submission.author_name,
//           contributor_id: submission.submitter_id,
//           region_id: submission.region_id,
//           difficulty: submission.difficulty,
//           duration_minutes: submission.duration_minutes,
//           audio_url: submission.audio_url,
//           image_url: submission.image_url,
//         });

//       if (contentError) throw contentError;

//       // Update submission status
//       const { error: updateError } = await supabase
//         .from('submissions')
//         .update({
//           status: 'approved',
//           reviewed_by: user?.id,
//           reviewed_at: new Date().toISOString(),
//         })
//         .eq('id', submission.id);

//       if (updateError) throw updateError;

//       toast({
//         title: "Submission Approved",
//         description: "Content has been published successfully.",
//       });

//       fetchAdminData();
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     }
//   };

//   const handleRejectSubmission = async () => {
//     if (!selectedSubmission) return;

//     try {
//       const { error } = await supabase
//         .from('submissions')
//         .update({
//           status: 'rejected',
//           reviewed_by: user?.id,
//           reviewed_at: new Date().toISOString(),
//           rejection_reason: rejectionReason,
//         })
//         .eq('id', selectedSubmission.id);

//       if (error) throw error;

//       toast({
//         title: "Submission Rejected",
//         description: "The submitter will be notified.",
//       });

//       setSelectedSubmission(null);
//       setRejectionReason("");
//       fetchAdminData();
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     }
//   };

//   if (!isAdmin) {
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <Navigation user={user} />

//       <div className="container mx-auto px-4 py-8">
//         <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

//         {/* Stats Cards */}
//         <div className="grid md:grid-cols-3 gap-6 mb-8">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Content</CardTitle>
//               <FileText className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{stats.totalContent}</div>
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Users</CardTitle>
//               <Users className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{stats.totalUsers}</div>
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
//               <Brain className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{stats.pendingSubmissions}</div>
//             </CardContent>
//           </Card>
//         </div>

//         <Tabs defaultValue="submissions" className="space-y-6">
//           <TabsList>
//             <TabsTrigger value="submissions">Submissions</TabsTrigger>
//             <TabsTrigger value="users">Users</TabsTrigger>
//           </TabsList>

//           <TabsContent value="submissions">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Content Submissions</CardTitle>
//                 <CardDescription>Review and manage user submissions</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {submissions.map((submission) => (
//                     <Card key={submission.id}>
//                       <CardContent className="p-6">
//                         <div className="flex justify-between items-start mb-4">
//                           <div className="flex-1">
//                             <div className="flex items-center gap-2 mb-2">
//                               <Badge>{submission.type}</Badge>
//                               <Badge variant={
//                                 submission.status === 'pending' ? 'outline' :
//                                 submission.status === 'approved' ? 'default' : 'destructive'
//                               }>
//                                 {submission.status}
//                               </Badge>
//                             </div>
//                             <h3 className="text-lg font-semibold mb-1">{submission.title}</h3>
//                             <p className="text-sm text-muted-foreground mb-2">
//                               By: {submission.profiles?.full_name || 'Unknown'} | 
//                               Region: {submission.regions?.name || 'Not specified'}
//                             </p>
//                             <p className="text-sm text-muted-foreground line-clamp-3">
//                               {submission.content}
//                             </p>
//                           </div>
//                         </div>
                        
//                         {submission.status === 'pending' && (
//                           <div className="flex gap-2">
//                             <Button
//                               size="sm"
//                               onClick={() => handleApproveSubmission(submission)}
//                               className="bg-green-600 hover:bg-green-700"
//                             >
//                               <CheckCircle className="mr-2" size={16} />
//                               Approve
//                             </Button>
//                             <Button
//                               size="sm"
//                               variant="destructive"
//                               onClick={() => setSelectedSubmission(submission)}
//                             >
//                               <XCircle className="mr-2" size={16} />
//                               Reject
//                             </Button>
//                           </div>
//                         )}
//                       </CardContent>
//                     </Card>
//                   ))}

//                   {submissions.length === 0 && (
//                     <p className="text-center text-muted-foreground py-8">
//                       No submissions to review.
//                     </p>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="users">
//             <Card>
//               <CardHeader>
//                 <CardTitle>User Management</CardTitle>
//                 <CardDescription>View and manage platform users</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-3">
//                   {users.map((profile) => (
//                     <div key={profile.id} className="flex justify-between items-center p-4 border rounded-lg">
//                       <div>
//                         <p className="font-medium">{profile.full_name || 'No name'}</p>
//                         <p className="text-sm text-muted-foreground">
//                           Joined: {new Date(profile.created_at).toLocaleDateString()}
//                         </p>
//                       </div>
//                       <div className="flex gap-2">
//                         {profile.user_roles?.map((role: any) => (
//                           <Badge key={role.role}>{role.role}</Badge>
//                         ))}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>

//         {/* Rejection Dialog */}
//         <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Reject Submission</DialogTitle>
//               <DialogDescription>
//                 Please provide a reason for rejecting this submission.
//               </DialogDescription>
//             </DialogHeader>
//             <Textarea
//               value={rejectionReason}
//               onChange={(e) => setRejectionReason(e.target.value)}
//               placeholder="Explain why this submission is being rejected..."
//               rows={4}
//             />
//             <DialogFooter>
//               <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
//                 Cancel
//               </Button>
//               <Button variant="destructive" onClick={handleRejectSubmission}>
//                 Confirm Rejection
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </div>
//   );
// };

// export default Admin;
