import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CATEGORIES, PLATFORMS } from "@/lib/mock-data";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Hexagon, Globe, User, CheckCircle, LogIn, Lock, Upload, X, ImageIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/auth";
import { useLocation } from "wouter";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  platform: z.string(),
  inviteLink: z.string().url("Please enter a valid URL."),
  category: z.string(),
  description: z.string().min(10, "Description must be at least 10 characters."),
  tags: z.string(),
  visibility: z.enum(["public", "boys-only", "girls-only"]),
  isAdmin: z.boolean().refine(val => val === true, "You must be an admin to list a community."),
});

export default function ListCommunity() {
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pendingValues, setPendingValues] = useState<z.infer<typeof formSchema> | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 2MB",
          variant: "destructive",
        });
        return;
      }
      
      if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Only JPEG, PNG, WebP, and GIF are allowed",
          variant: "destructive",
        });
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      
      const response = await fetch("/api/upload/community-image", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      if (data.success) {
        return data.imageUrl;
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      const timer = setTimeout(() => {
        setLoginModalOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (user) {
      setLoginModalOpen(false);
    }
  }, [user, isLoading]);

  const handleLoginRedirect = () => {
    setLocation("/login");
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      tags: "",
      description: "",
      inviteLink: "",
      visibility: "public",
      isAdmin: false,
    },
  });

  function handleSubmitClick(values: z.infer<typeof formSchema>) {
    setPendingValues(values);
    setConfirmOpen(true);
  }

  async function handleConfirmSubmit() {
    if (!pendingValues) return;
    
    setIsSubmitting(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const tagsArray = pendingValues.tags
        .split(",")
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);

      const response = await fetch("/api/communities/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: pendingValues.name,
          platform: pendingValues.platform,
          description: pendingValues.description,
          category: pendingValues.category,
          inviteLink: pendingValues.inviteLink,
          visibility: pendingValues.visibility,
          tags: tagsArray,
          memberCount: 0,
          userId: user?.id || null,
          imageUrl: imageUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setConfirmOpen(false);
        removeImage();
        form.reset();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit community",
          variant: "destructive",
        });
        setConfirmOpen(false);
      }
    } catch (error) {
      console.error("Error submitting community:", error);
      toast({
        title: "Error",
        description: "Failed to submit community. Please try again.",
        variant: "destructive",
      });
      setConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCloseDialog() {
    if (!isSubmitting) {
      setConfirmOpen(false);
      setPendingValues(null);
    }
  }

  function handleCloseSuccessDialog() {
    setSubmitted(false);
    form.reset();
  }

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-16 max-w-3xl mx-auto">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-6 bg-[#FFC400]/20 rounded-full">
             <Hexagon className="w-6 h-6 text-[#FFC400]" />
          </div>
          <h1 className="text-4xl font-black font-heading mb-4 uppercase tracking-tight text-black">List Your Community</h1>
          <p className="text-lg text-black/70">Share your group with thousands of students.</p>
        </div>

        <Card className="border-black/20 bg-white rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#FFC400] to-[#FF8C00]"></div>
          <CardHeader className="p-8 border-b border-black/10">
            <CardTitle className="text-xl font-bold uppercase tracking-wider text-black">Community Details</CardTitle>
            <CardDescription className="text-black/60">Please provide accurate information about your community.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmitClick)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem className="bg-gradient-to-r from-[#FFC400]/10 to-[#FF8C00]/10 border-2 border-[#FFC400]/30 p-6 rounded-2xl">
                      <FormLabel className="uppercase font-bold text-sm tracking-widest text-black flex items-center gap-2 mb-4">
                        <Globe className="h-4 w-4" />
                        Who can join this community?
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col sm:flex-row gap-4"
                        >
                          <div className="flex items-center space-x-3 bg-white border-2 border-green-400/50 rounded-xl px-4 py-3 cursor-pointer hover:border-green-500 transition-colors">
                            <RadioGroupItem value="public" id="public" className="border-green-500 text-green-500" />
                            <Label htmlFor="public" className="font-bold text-black cursor-pointer flex items-center gap-2">
                              <Globe className="h-4 w-4 text-green-500" />
                              Public (Everyone)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 bg-white border-2 border-blue-400/50 rounded-xl px-4 py-3 cursor-pointer hover:border-blue-500 transition-colors">
                            <RadioGroupItem value="boys-only" id="boys-only" className="border-blue-500 text-blue-500" />
                            <Label htmlFor="boys-only" className="font-bold text-black cursor-pointer flex items-center gap-2">
                              <User className="h-4 w-4 text-blue-500" />
                              Boys Only
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 bg-white border-2 border-pink-400/50 rounded-xl px-4 py-3 cursor-pointer hover:border-pink-500 transition-colors">
                            <RadioGroupItem value="girls-only" id="girls-only" className="border-pink-500 text-pink-500" />
                            <Label htmlFor="girls-only" className="font-bold text-black cursor-pointer flex items-center gap-2">
                              <User className="h-4 w-4 text-pink-500" />
                              Girls Only
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase font-bold text-xs tracking-widest text-black/70">Community Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. SRM Coding Wizards" {...field} className="bg-gray-50 border-black/20 h-12 text-black placeholder:text-black/40 focus:border-[#FFC400] rounded-2xl focus:shadow-[0_0_15px_rgba(255,196,0,0.2)]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase font-bold text-xs tracking-widest text-black/70">Platform</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-50 border-black/20 h-12 text-black focus:ring-[#FFC400] focus:border-[#FFC400] rounded-2xl focus:shadow-[0_0_15px_rgba(255,196,0,0.2)]">
                              <SelectValue placeholder="Select platform" className="text-black" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white border-black/20 text-black">
                            {PLATFORMS.map(p => <SelectItem key={p} value={p} className="focus:bg-[#FFC400] focus:text-black uppercase font-bold text-xs tracking-wider">{p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase font-bold text-xs tracking-widest text-black/70">Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-50 border-black/20 h-12 text-black focus:ring-[#FFC400] focus:border-[#FFC400] rounded-2xl focus:shadow-[0_0_15px_rgba(255,196,0,0.2)]">
                              <SelectValue placeholder="Select category" className="text-black" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white border-black/20 text-black">
                             {CATEGORIES.map(c => <SelectItem key={c} value={c} className="focus:bg-[#FFC400] focus:text-black uppercase font-bold text-xs tracking-wider">{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="inviteLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase font-bold text-xs tracking-widest text-black/70">Invite Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://chat.whatsapp.com/..." {...field} className="bg-gray-50 border-black/20 h-12 text-black placeholder:text-black/40 focus:border-[#FFC400] rounded-2xl focus:shadow-[0_0_15px_rgba(255,196,0,0.2)]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase font-bold text-xs tracking-widest text-black/70">Tags (comma separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="coding, tech, beginners" {...field} className="bg-gray-50 border-black/20 h-12 text-black placeholder:text-black/40 focus:border-[#FFC400] rounded-2xl focus:shadow-[0_0_15px_rgba(255,196,0,0.2)]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase font-bold text-xs tracking-widest text-black/70">Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tell us what your community is about..." className="resize-none bg-gray-50 border-black/20 min-h-[120px] text-black placeholder:text-black/40 focus:border-[#FFC400] rounded-2xl focus:shadow-[0_0_15px_rgba(255,196,0,0.2)]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <Label className="uppercase font-bold text-xs tracking-widest text-black/70">Community Photo (Optional)</Label>
                  <div className="flex justify-center">
                    {imagePreview ? (
                      <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-2 border-[#FFC400]/30 bg-gray-50">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ) : (
                      <label 
                        htmlFor="community-image" 
                        className="flex flex-col items-center justify-center w-48 h-48 rounded-2xl border-2 border-dashed border-black/20 bg-gray-50 cursor-pointer hover:border-[#FFC400] hover:bg-[#FFC400]/5 transition-all"
                      >
                        <div className="flex flex-col items-center justify-center p-4">
                          <div className="w-12 h-12 mb-3 bg-[#FFC400]/10 rounded-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-[#FFC400]" />
                          </div>
                          <p className="mb-1 text-sm text-black/70 text-center">
                            <span className="font-bold">Click to upload</span>
                          </p>
                          <p className="text-xs text-black/50 text-center">or drag and drop</p>
                          <p className="text-xs text-black/40 mt-2 text-center">PNG, JPG, WebP, GIF<br/>(MAX. 2MB)</p>
                        </div>
                        <input 
                          id="community-image" 
                          type="file" 
                          className="hidden" 
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handleImageChange}
                          ref={fileInputRef}
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-black/50">Add a photo to make your community stand out. This will be displayed on the community card.</p>
                </div>

                <FormField
                  control={form.control}
                  name="isAdmin"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-4 space-y-0 border-2 border-black/10 bg-gray-50 p-6 rounded-2xl">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-[#FFC400] data-[state=checked]:text-black data-[state=checked]:border-[#FFC400] border-black/30 w-5 h-5 mt-1 rounded"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-base font-bold text-black">
                          I am an admin/mod of this group
                        </FormLabel>
                        <FormDescription className="text-black/60">
                          You confirm that you have the right to share this invite link.
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white font-black text-lg h-14 uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-xl transition-all mt-4">
                  Submit Community
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <Dialog open={confirmOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="bg-white rounded-3xl max-w-md shadow-2xl border-0 flex flex-col items-center text-center p-8">
            <DialogHeader className="w-full">
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-black text-center">Confirm Submission</DialogTitle>
              <DialogDescription className="text-black/70 mt-3 text-center">
                Are you sure you want to submit this community? Your request will be sent for approval.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 justify-center items-center mx-auto w-full mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSubmitting}
                className="border-black/30 text-black hover:bg-gray-100 font-bold uppercase tracking-wider px-8 rounded-2xl h-12"
              >
                No, Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="bg-black hover:bg-gray-800 text-white font-bold uppercase tracking-wider px-8 rounded-2xl h-12"
              >
                {isSubmitting ? "Submitting..." : "Yes, Submit"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={submitted} onOpenChange={handleCloseSuccessDialog}>
          <DialogContent className="bg-white rounded-3xl max-w-md shadow-2xl border-0 flex flex-col items-center text-center p-8">
            <div className="w-16 h-16 mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <DialogHeader className="w-full">
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-black text-center">Community Submitted!</DialogTitle>
              <DialogDescription className="text-black/70 mt-4 text-center">
                <p className="mb-2">Your request has been submitted for approval.</p>
                <p>Your community is now pending review and will be listed shortly.</p>
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 justify-center items-center mx-auto w-full mt-8">
              <Button
                type="button"
                onClick={() => window.location.href = "/"}
                className="bg-black hover:bg-gray-800 text-white font-bold uppercase tracking-wider px-8 rounded-2xl h-12"
              >
                Back to Home
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Login Required Dialog */}
        <Dialog open={loginModalOpen} onOpenChange={() => {}}>
          <DialogContent className="bg-white rounded-3xl max-w-md shadow-2xl border-0 flex flex-col items-center text-center p-8 [&>button]:hidden">
            <div className="w-20 h-20 mb-6 bg-gradient-to-br from-[#FFC400]/20 to-[#FF8C00]/20 rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-[#FFC400]" />
            </div>
            <DialogHeader className="w-full">
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-black text-center">Login Required</DialogTitle>
              <DialogDescription className="text-black/70 mt-4 text-center text-base">
                <span className="block">You need to be logged in to list your community.</span>
                <span className="block mt-2 text-sm">This helps you track your reach, boost visibility, and attract more members.</span>
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 w-full mt-8">
              <Button
                type="button"
                onClick={handleLoginRedirect}
                className="w-full bg-[#FFC400] hover:bg-[#FFB700] text-black font-bold uppercase tracking-wider px-8 rounded-2xl h-14 flex items-center justify-center gap-2 shadow-lg"
              >
                <LogIn className="w-5 h-5" />
                Log In to Continue
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = "/"}
                className="w-full border-black/20 text-black/70 hover:bg-gray-100 font-medium px-8 rounded-2xl h-12"
              >
                Back to Home
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
