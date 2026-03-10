import { useState, useRef } from 'react';
import { 
  Heart, Calendar, Clock, Camera, Music, 
  Send, Sparkles, MessageCircle, ChevronDown,
  Upload, Check, Volume2, VolumeX,
  QrCode, Copy, Share2, PartyPopper,
  Flower2, Church, Utensils, Cake, Wine, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast, Toaster } from 'sonner';
import { CameraCapture } from '@/components/CameraCapture';
import './App.css';

// Wedding Details
const WEDDING_DETAILS = {
  couple: {
    bride: { name: 'Chinazaekpere', nickname: 'Naza', fullName: 'Chinazaekpere E. Alozie' },
    groom: { name: 'Chukwuemeka', nickname: 'Emeka', fullName: 'Chukwuemeka P. Onyebuenyi' },
  },
  traditional: {
    date: 'Saturday, April 4th, 2026',
    venue: "HRH, Late Eze R.O. Alozie's Compound",
    location: 'Umuibe Village, Apu-Ukwu Autonomous Community, Isi Ala Ngwa South LGA, Abia State',
  },
  white: {
    date: 'Saturday, April 11th, 2026',
    time: '11:00 AM',
    venue: 'RCCG Beautiful Land Parish (RV9HQ)',
    location: 'No 28 Nsirim Road Mile 4 Rumueme, Port Harcourt, Rivers State',
  },
  reception: {
    venue: 'Hotel De Telavee',
    location: '60 Rumuepirikom/Iwofe Rd, Port Harcourt, Rivers State',
  },
  hashtag: '#AC²LoveStory',
  colors: ['Blush Pink', 'Olive Green', 'Gold'],
};

// Order of Program
const ORDER_OF_PROGRAM = [
  { time: '10:30 AM', event: 'Guest Arrival & Seating', icon: Users, description: 'Welcome guests and ushers to their seats' },
  { time: '11:00 AM', event: 'Processional', icon: Music, description: 'Bridal party entrance with musical accompaniment' },
  { time: '11:15 AM', event: 'Opening Prayer & Hymn', icon: Church, description: 'Invocation and opening worship' },
  { time: '11:30 AM', event: 'Exchange of Vows', icon: Heart, description: 'The couple recites their heartfelt vows' },
  { time: '11:45 AM', event: 'Ring Exchange', icon: Sparkles, description: 'Symbolic giving of wedding rings' },
  { time: '12:00 PM', event: 'Pronouncement & Kiss', icon: PartyPopper, description: 'Officially pronounced as husband and wife' },
  { time: '12:15 PM', event: 'Signing of Register', icon: Check, description: 'Legal documentation of the marriage' },
  { time: '12:30 PM', event: 'Recessional', icon: Music, description: 'Joyful exit of the newlyweds' },
  { time: '1:00 PM', event: 'Cocktail Hour', icon: Wine, description: 'Refreshments and photo opportunities' },
  { time: '2:00 PM', event: 'Reception Begins', icon: Utensils, description: 'Grand entrance and opening remarks' },
  { time: '2:30 PM', event: 'First Dance', icon: Music, description: 'The couple\'s special moment' },
  { time: '3:00 PM', event: 'Dinner Service', icon: Utensils, description: 'Enjoy the delicious wedding feast' },
  { time: '4:00 PM', event: 'Cake Cutting', icon: Cake, description: 'Traditional cake cutting ceremony' },
  { time: '4:30 PM', event: 'Bouquet & Garter Toss', icon: Flower2, description: 'Fun traditions for the single guests' },
  { time: '5:00 PM', event: 'Open Dancing', icon: Music, description: 'Let\'s dance the night away!' },
];

// Wedding Quiz Questions
const WEDDING_QUIZ = [
  {
    question: 'Where did Naza and Emeka first meet?',
    options: ['At church', 'At university', 'Through a mutual friend', 'At a wedding'],
    correct: 1,
  },
  {
    question: 'What is the couple\'s favorite date night activity?',
    options: ['Movie nights', 'Dinner dates', 'Long walks', 'Game nights'],
    correct: 0,
  },
  {
    question: 'What is Emeka\'s favorite food that Naza cooks?',
    options: ['Jollof rice', 'Egusi soup', 'Fried rice', 'Pounded yam'],
    correct: 1,
  },
  {
    question: 'Where did Emeka propose to Naza?',
    options: ['At a restaurant', 'On the beach', 'At a garden', 'At home'],
    correct: 2,
  },
];

// Sample well wishes
const SAMPLE_WISHES = [
  { name: 'The Johnson Family', message: 'Wishing you a lifetime of love and happiness! May your journey together be filled with joy.', time: '2 hours ago' },
  { name: 'Auntie Ngozi', message: 'My dear children, may God bless your union abundantly. So happy to see this day!', time: '5 hours ago' },
  { name: 'Best Friend Chioma', message: 'Naza, you look absolutely stunning! Here\'s to forever with your soulmate!', time: '1 day ago' },
];

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [wishesDialogOpen, setWishesDialogOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{file: File, type: 'photo' | 'video', preview: string}[]>([]);
  const [noteForm, setNoteForm] = useState({ name: '', message: '' });
  const [wishes] = useState(SAMPLE_WISHES);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [uploadedToDrive, setUploadedToDrive] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  // Handle camera capture
  const handleCapture = (file: File, type: 'photo' | 'video') => {
    const preview = URL.createObjectURL(file);
    setUploadedFiles(prev => [...prev, { file, type, preview }]);
    
    // Simulate Google Drive upload
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          setUploadedToDrive(prev => [...prev, file.name]);
          resolve(true);
        }, 2000);
      }),
      {
        loading: 'Uploading to Google Drive...',
        success: `Successfully uploaded ${type} to Google Drive!`,
        error: 'Upload failed',
      }
    );
  };

  // Handle note submission
  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.name.trim() || !noteForm.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    toast.success('Your message has been sent to the couple!');
    setNoteForm({ name: '', message: '' });
    setNoteDialogOpen(false);
  };

  // Handle quiz submission
  const handleQuizSubmit = () => {
    if (quizAnswers.length < WEDDING_QUIZ.length) {
      toast.error('Please answer all questions');
      return;
    }
    setQuizSubmitted(true);
    
    const score = quizAnswers.reduce((acc, answer, idx) => 
      acc + (answer === WEDDING_QUIZ[idx].correct ? 1 : 0), 0
    );
    
    toast.success(`You scored ${score}/${WEDDING_QUIZ.length}! ${score === WEDDING_QUIZ.length ? 'Perfect! You know the couple well!' : ''}`);
  };

  // Toggle music
  const toggleMusic = () => {
    if (audioRef.current) {
      if (musicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          toast.error('Could not play audio');
        });
      }
      setMusicPlaying(!musicPlaying);
    }
  };

  // Copy QR link
  const copyQrLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <Toaster position="top-center" richColors />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-50/90 backdrop-blur-md border-b border-gold-200/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-blush-400 fill-blush-400" />
            <span className="font-serif text-lg text-olive-700">
              {WEDDING_DETAILS.couple.bride.nickname} & {WEDDING_DETAILS.couple.groom.nickname}
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            {[
              { id: 'home', label: 'Home' },
              { id: 'program', label: 'Program' },
              { id: 'memories', label: 'Memories' },
              { id: 'activities', label: 'Activities' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-sm transition-colors ${
                  activeSection === item.id 
                    ? 'text-blush-500 font-medium' 
                    : 'text-olive-600 hover:text-blush-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMusic}
              className="text-olive-600"
            >
              {musicPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQrDialogOpen(true)}
              className="text-olive-600"
            >
              <QrCode className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen pt-20 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/hero-floral.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cream-50/60 via-cream-50/40 to-cream-50" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="animate-fade-in">
            <p className="text-olive-600 text-sm tracking-[0.3em] uppercase mb-4">
              Together with our families
            </p>
            
            <h1 className="font-serif text-5xl md:text-7xl text-olive-800 mb-2">
              {WEDDING_DETAILS.couple.bride.nickname}
            </h1>
            <p className="font-script text-4xl md:text-5xl text-blush-400 mb-2">&</p>
            <h1 className="font-serif text-5xl md:text-7xl text-olive-800 mb-6">
              {WEDDING_DETAILS.couple.groom.nickname}
            </h1>
            
            <p className="text-gold-500 text-lg tracking-wider mb-8">
              {WEDDING_DETAILS.hashtag}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Badge variant="outline" className="border-blush-300 text-blush-500 px-4 py-2">
                <Calendar className="w-4 h-4 mr-2" />
                {WEDDING_DETAILS.white.date}
              </Badge>
              <Badge variant="outline" className="border-gold-300 text-gold-500 px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />
                {WEDDING_DETAILS.white.time}
              </Badge>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                onClick={() => scrollToSection('program')}
                className="bg-blush-400 hover:bg-blush-500 text-white px-8 py-6 text-lg rounded-full shadow-wedding"
              >
                <Calendar className="w-5 h-5 mr-2" />
                View Program
              </Button>
              <Button
                onClick={() => setCameraOpen(true)}
                variant="outline"
                className="border-gold-400 text-gold-600 hover:bg-gold-50 px-8 py-6 text-lg rounded-full"
              >
                <Camera className="w-5 h-5 mr-2" />
                Share Memories
              </Button>
            </div>
          </div>
          
          {/* Wedding Details Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-16">
            <Card className="bg-white/80 backdrop-blur-sm border-gold-200/50 shadow-wedding">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-olive-700">
                  <Church className="w-5 h-5 text-blush-400" />
                  White Wedding
                </CardTitle>
              </CardHeader>
              <CardContent className="text-left space-y-2">
                <p className="text-olive-600"><strong>Date:</strong> {WEDDING_DETAILS.white.date}</p>
                <p className="text-olive-600"><strong>Time:</strong> {WEDDING_DETAILS.white.time}</p>
                <p className="text-olive-600"><strong>Venue:</strong> {WEDDING_DETAILS.white.venue}</p>
                <p className="text-olive-500 text-sm">{WEDDING_DETAILS.white.location}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-gold-200/50 shadow-wedding">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-olive-700">
                  <Utensils className="w-5 h-5 text-blush-400" />
                  Reception
                </CardTitle>
              </CardHeader>
              <CardContent className="text-left space-y-2">
                <p className="text-olive-600"><strong>Venue:</strong> {WEDDING_DETAILS.reception.venue}</p>
                <p className="text-olive-500 text-sm">{WEDDING_DETAILS.reception.location}</p>
                <div className="flex gap-2 mt-3">
                  {WEDDING_DETAILS.colors.map(color => (
                    <Badge key={color} variant="secondary" className="text-xs">
                      {color}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-olive-400" />
        </div>
      </section>

      {/* Order of Program Section */}
      <section id="program" className="py-20 bg-gradient-to-b from-cream-50 to-blush-50/30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <Sparkles className="w-8 h-8 text-gold-400 mx-auto mb-4" />
            <h2 className="font-serif text-4xl text-olive-800 mb-2">Order of Program</h2>
            <p className="text-olive-500">A day filled with love and celebration</p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blush-300 via-gold-300 to-blush-300 md:-translate-x-1/2" />
            
            {ORDER_OF_PROGRAM.map((item, index) => {
              const isLeft = index % 2 === 0;
              
              return (
                <div 
                  key={index}
                  className={`relative flex items-start gap-4 mb-8 ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-white border-2 border-blush-300 flex items-center justify-center z-10 md:-translate-x-1/2">
                    <div className="w-3 h-3 rounded-full bg-blush-400" />
                  </div>
                  
                  {/* Content */}
                  <div className={`ml-12 md:ml-0 md:w-[45%] ${isLeft ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'}`}>
                    <Card className="bg-white/90 border-gold-200/50 hover:shadow-wedding transition-shadow">
                      <CardContent className="p-4">
                        <div className={`flex items-center gap-2 mb-2 ${isLeft ? 'md:justify-end' : ''}`}>
                          <Badge variant="outline" className="text-blush-500 border-blush-200">
                            {item.time}
                          </Badge>
                        </div>
                        <h3 className="font-serif text-lg text-olive-700 mb-1">{item.event}</h3>
                        <p className="text-olive-500 text-sm">{item.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Memories Section */}
      <section id="memories" className="py-20 bg-cream-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Camera className="w-8 h-8 text-blush-400 mx-auto mb-4" />
            <h2 className="font-serif text-4xl text-olive-800 mb-2">Capture the Moments</h2>
            <p className="text-olive-500">Share your photos and videos with the couple</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-white border-gold-200/50 shadow-wedding overflow-hidden">
              <div 
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: 'url(/ceremony-aisle.jpg)' }}
              />
              <CardContent className="p-6">
                <h3 className="font-serif text-xl text-olive-700 mb-2">Take Photos & Videos</h3>
                <p className="text-olive-500 mb-4">
                  Use your camera to capture special moments during the ceremony and reception. 
                  All media will be uploaded directly to the couple's Google Drive.
                </p>
                <Button 
                  onClick={() => setCameraOpen(true)}
                  className="w-full bg-blush-400 hover:bg-blush-500 text-white"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Open Camera
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gold-200/50 shadow-wedding overflow-hidden">
              <div 
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: 'url(/reception-table.jpg)' }}
              />
              <CardContent className="p-6">
                <h3 className="font-serif text-xl text-olive-700 mb-2">Send a Message</h3>
                <p className="text-olive-500 mb-4">
                  Write a heartfelt note to the newlyweds. Your message will be collected 
                  into a beautiful memory book for the couple.
                </p>
                <Button 
                  onClick={() => setNoteDialogOpen(true)}
                  variant="outline"
                  className="w-full border-gold-400 text-gold-600 hover:bg-gold-50"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Write a Note
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="mt-12">
              <h3 className="font-serif text-2xl text-olive-700 mb-6 text-center">Your Shared Memories</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    {file.type === 'photo' ? (
                      <img 
                        src={file.preview} 
                        alt="Uploaded" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <video 
                        src={file.preview} 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      {uploadedToDrive.includes(file.file.name) ? (
                        <Check className="w-6 h-6 text-green-400" />
                      ) : (
                        <Upload className="w-6 h-6 text-white" />
                      )}
                    </div>
                    {uploadedToDrive.includes(file.file.name) && (
                      <Badge className="absolute top-2 right-2 bg-green-500 text-white text-xs">
                        Saved
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Activities Section */}
      <section id="activities" className="py-20 bg-gradient-to-b from-blush-50/30 to-cream-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <PartyPopper className="w-8 h-8 text-gold-400 mx-auto mb-4" />
            <h2 className="font-serif text-4xl text-olive-800 mb-2">Fun Activities</h2>
            <p className="text-olive-500">Join in the celebration with these interactive activities</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Wedding Quiz */}
            <Card className="bg-white border-gold-200/50 shadow-wedding hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-blush-100 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-blush-400" />
                </div>
                <CardTitle className="font-serif text-xl text-olive-700">Wedding Quiz</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-olive-500 mb-4">
                  Test your knowledge about the couple! How well do you know Naza and Emeka?
                </p>
                <Button 
                  onClick={() => setQuizDialogOpen(true)}
                  variant="outline"
                  className="w-full border-blush-300 text-blush-500 hover:bg-blush-50"
                >
                  Take the Quiz
                </Button>
              </CardContent>
            </Card>
            
            {/* Well Wishes Wall */}
            <Card className="bg-white border-gold-200/50 shadow-wedding hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-gold-500" />
                </div>
                <CardTitle className="font-serif text-xl text-olive-700">Well Wishes Wall</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-olive-500 mb-4">
                  Read messages from other guests and add your own wishes for the happy couple.
                </p>
                <Button 
                  onClick={() => setWishesDialogOpen(true)}
                  variant="outline"
                  className="w-full border-gold-300 text-gold-500 hover:bg-gold-50"
                >
                  View Wishes
                </Button>
              </CardContent>
            </Card>
            
            {/* Photo Challenge */}
            <Card className="bg-white border-gold-200/50 shadow-wedding hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-olive-100 flex items-center justify-center mb-4">
                  <Camera className="w-6 h-6 text-olive-500" />
                </div>
                <CardTitle className="font-serif text-xl text-olive-700">Photo Challenge</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-olive-500 mb-4">
                  Complete fun photo challenges throughout the event and share your creativity!
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-olive-600">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Capture the first dance</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-olive-600">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Group photo at reception</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-olive-600">
                    <div className="w-4 h-4 rounded-full border-2 border-olive-300" />
                    <span>Selfie with the couple</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-olive-800 text-cream-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Heart className="w-8 h-8 text-blush-400 mx-auto mb-4 fill-blush-400" />
          <h2 className="font-serif text-3xl mb-2">
            {WEDDING_DETAILS.couple.bride.nickname} & {WEDDING_DETAILS.couple.groom.nickname}
          </h2>
          <p className="text-gold-400 mb-6">{WEDDING_DETAILS.hashtag}</p>
          
          <div className="flex justify-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={copyQrLink}
              className="border-cream-300 text-cream-100 hover:bg-cream-100/10"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `${WEDDING_DETAILS.couple.bride.nickname} & ${WEDDING_DETAILS.couple.groom.nickname} Wedding`,
                    url: window.location.href,
                  });
                } else {
                  copyQrLink();
                }
              }}
              className="border-cream-300 text-cream-100 hover:bg-cream-100/10"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
          
          <Separator className="bg-olive-600 mb-6" />
          
          <p className="text-olive-400 text-sm">
            Made with love for our special day
          </p>
        </div>
      </footer>

      {/* Camera Dialog */}
      <CameraCapture
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCapture}
      />

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="bg-cream-50">
          <DialogHeader>
            <DialogTitle className="text-center font-serif text-2xl text-olive-700">
              Scan to Join
            </DialogTitle>
            <DialogDescription className="text-center">
              Share this QR code with guests to access the wedding experience
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            <div className="bg-white p-6 rounded-xl shadow-lg mb-4">
              <QrCode className="w-48 h-48 text-olive-700" />
            </div>
            <p className="text-sm text-olive-500 mb-4">{window.location.href}</p>
            <Button onClick={copyQrLink} variant="outline">
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="bg-cream-50 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center font-serif text-2xl text-olive-700">
              Send a Note to the Couple
            </DialogTitle>
            <DialogDescription className="text-center">
              Your message will be treasured forever
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNoteSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-olive-600 mb-1 block">Your Name</label>
              <Input
                value={noteForm.name}
                onChange={(e) => setNoteForm({ ...noteForm, name: e.target.value })}
                placeholder="Enter your name"
                className="border-gold-200"
              />
            </div>
            <div>
              <label className="text-sm text-olive-600 mb-1 block">Your Message</label>
              <Textarea
                value={noteForm.message}
                onChange={(e) => setNoteForm({ ...noteForm, message: e.target.value })}
                placeholder="Write your heartfelt message..."
                rows={5}
                className="border-gold-200"
              />
            </div>
            <Button type="submit" className="w-full bg-blush-400 hover:bg-blush-500 text-white">
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quiz Dialog */}
      <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
        <DialogContent className="bg-cream-50 max-w-lg max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-center font-serif text-2xl text-olive-700">
              How Well Do You Know the Couple?
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6">
              {WEDDING_QUIZ.map((q, idx) => (
                <div key={idx} className="space-y-3">
                  <p className="font-medium text-olive-700">{idx + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((option, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => {
                          const newAnswers = [...quizAnswers];
                          newAnswers[idx] = optIdx;
                          setQuizAnswers(newAnswers);
                        }}
                        disabled={quizSubmitted}
                        className={`w-full p-3 text-left rounded-lg border transition-all ${
                          quizAnswers[idx] === optIdx
                            ? quizSubmitted
                              ? optIdx === q.correct
                                ? 'border-green-500 bg-green-50'
                                : 'border-red-500 bg-red-50'
                              : 'border-blush-400 bg-blush-50'
                            : 'border-gold-200 hover:border-blush-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-olive-600">{option}</span>
                          {quizSubmitted && optIdx === q.correct && (
                            <Check className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          {!quizSubmitted ? (
            <Button 
              onClick={handleQuizSubmit}
              className="w-full bg-gold-500 hover:bg-gold-600 text-white mt-4"
            >
              Submit Answers
            </Button>
          ) : (
            <Button 
              onClick={() => {
                setQuizAnswers([]);
                setQuizSubmitted(false);
              }}
              variant="outline"
              className="w-full mt-4"
            >
              Try Again
            </Button>
          )}
        </DialogContent>
      </Dialog>

      {/* Wishes Dialog */}
      <Dialog open={wishesDialogOpen} onOpenChange={setWishesDialogOpen}>
        <DialogContent className="bg-cream-50 max-w-lg max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-center font-serif text-2xl text-olive-700">
              Well Wishes Wall
            </DialogTitle>
            <DialogDescription className="text-center">
              Heartfelt messages from family and friends
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[50vh] pr-4">
            <div className="space-y-4">
              {wishes.map((wish, idx) => (
                <Card key={idx} className="bg-white border-gold-200/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blush-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blush-500 font-medium">
                          {wish.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-olive-700">{wish.name}</span>
                          <span className="text-xs text-olive-400">{wish.time}</span>
                        </div>
                        <p className="text-olive-600 text-sm">{wish.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
          <Button 
            onClick={() => {
              setWishesDialogOpen(false);
              setNoteDialogOpen(true);
            }}
            className="w-full bg-blush-400 hover:bg-blush-500 text-white mt-4"
          >
            <Heart className="w-4 h-4 mr-2" />
            Add Your Wish
          </Button>
        </DialogContent>
      </Dialog>

      {/* Hidden audio element for background music */}
      <audio ref={audioRef} loop>
        <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}

export default App;
