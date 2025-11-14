// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import Navigation from "@/components/Navigation";
// import { supabase } from "@/integrations/supabase/client";
// import { useToast } from "@/hooks/use-toast";
// import { User } from "@supabase/supabase-js";

// const ShareStory = () => {
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const [user, setUser] = useState<User | null>(null);
//   const [regions, setRegions] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
  
//   const [formData, setFormData] = useState({
//     type: "tantara",
//     title: "",
//     content: "",
//     author_name: "",
//     region_id: "",
//     difficulty: "medium",
//     duration_minutes: "",
//   });

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setUser(session?.user ?? null);
//       if (!session?.user) {
//         navigate("/auth");
//       }
//     });

//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null);
//       if (!session?.user) {
//         navigate("/auth");
//       }
//     });

//     fetchRegions();

//     return () => subscription.unsubscribe();
//   }, [navigate]);

//   const fetchRegions = async () => {
//     const { data } = await supabase
//       .from('regions')
//       .select('*')
//       .order('name');
    
//     if (data) setRegions(data);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const submitData = {
//         type: formData.type as any,
//         title: formData.title,
//         content: formData.content,
//         author_name: formData.author_name || null,
//         region_id: formData.region_id || null,
//         difficulty: formData.difficulty as any,
//         duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
//         submitter_id: user?.id,
//       };

//       const { error } = await supabase
//         .from('submissions')
//         .insert(submitData as any);

//       if (error) throw error;

//       toast({
//         title: "Misaotra! Thank you!",
//         description: "Your story has been submitted for review.",
//       });

//       navigate("/");
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!user) {
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <Navigation user={user} />

//       <div className="container mx-auto px-4 py-8 max-w-3xl">
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-3xl">Share Your Story</CardTitle>
//             <CardDescription>
//               Mizara ny Tantara - Contribute to preserving Malagasy cultural heritage
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="space-y-2">
//                 <Label htmlFor="type">Content Type</Label>
//                 <Select
//                   value={formData.type}
//                   onValueChange={(value) => setFormData({ ...formData, type: value })}
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="tantara">Tantara (Story)</SelectItem>
//                     <SelectItem value="ohabolana">Ohabolana (Proverb)</SelectItem>
//                     <SelectItem value="kabary">Kabary (Speech)</SelectItem>
//                     <SelectItem value="lovantsofina">Lovantsofina (Legend)</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="title">Title</Label>
//                 <Input
//                   id="title"
//                   value={formData.title}
//                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                   required
//                   placeholder="Enter the title"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="author">Author Name</Label>
//                 <Input
//                   id="author"
//                   value={formData.author_name}
//                   onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
//                   placeholder="Who told or created this?"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="region">Region</Label>
//                 <Select
//                   value={formData.region_id}
//                   onValueChange={(value) => setFormData({ ...formData, region_id: value })}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select a region" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {regions.map((region) => (
//                       <SelectItem key={region.id} value={region.id}>
//                         {region.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="difficulty">Difficulty</Label>
//                   <Select
//                     value={formData.difficulty}
//                     onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="easy">Easy</SelectItem>
//                       <SelectItem value="medium">Medium</SelectItem>
//                       <SelectItem value="hard">Hard</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="duration">Duration (minutes)</Label>
//                   <Input
//                     id="duration"
//                     type="number"
//                     value={formData.duration_minutes}
//                     onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
//                     placeholder="Estimated reading time"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="content">Content</Label>
//                 <Textarea
//                   id="content"
//                   value={formData.content}
//                   onChange={(e) => setFormData({ ...formData, content: e.target.value })}
//                   required
//                   rows={12}
//                   placeholder="Share the full story, proverb, speech, or legend..."
//                 />
//               </div>

//               <Button type="submit" className="w-full" disabled={loading}>
//                 {loading ? "Submitting..." : "Submit for Review"}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default ShareStory;
