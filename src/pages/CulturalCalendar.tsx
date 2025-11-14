import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { Calendar } from "lucide-react";

interface CalendarEvent {
  month: string;
  events: string[];
}

const CulturalCalendar = () => {
  const [calendarData, setCalendarData] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      // fetch from backend endpoint that reads `contenu/calendrier_culturel.txt`
      const res = await fetch('/api/calendrier');
      if (res.ok) {
        const data = await res.json();
        setCalendarData(data as CalendarEvent[]);
      } else {
        console.error('Erreur /api/calendrier status', res.status);
        setCalendarData([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement du calendrier:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Calendrier Culturel Malgache</h1>
          </div>
          <p className="text-muted-foreground">
            Découvrez les événements et traditions culturelles malgaches tout au long de l'année
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement du calendrier...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calendarData.map((month, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Badge variant="outline">{month.month}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {month.events.map((event, eventIdx) => (
                      <li
                        key={eventIdx}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-primary mt-1">•</span>
                        <span>{event}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-12 bg-card p-6 rounded-lg border border-border">
          <h2 className="text-2xl font-bold mb-4">À Propos du Calendrier Culturel</h2>
          <p className="text-muted-foreground mb-4">
            Le calendrier culturel malgache reflète la richesse et la diversité des traditions
            de l'île. Ces événements et cérémonies varient selon les régions et les ethnies,
            mais ils représentent tous l'essence de la culture malgache.
          </p>
          <p className="text-muted-foreground">
            Les dates peuvent varier selon les années, les régions et les traditions locales.
            Nous vous encourageons à explorer et à participer à ces événements culturels
            importants.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CulturalCalendar;
