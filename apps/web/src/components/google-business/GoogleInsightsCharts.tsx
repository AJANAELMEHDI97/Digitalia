import { TrendingUp, Eye, Phone, Navigation, Globe, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

// Mock data - will be replaced with real API data when configured
const mockViewsData = [
  { date: '01/01', views: 120 },
  { date: '02/01', views: 145 },
  { date: '03/01', views: 132 },
  { date: '04/01', views: 168 },
  { date: '05/01', views: 189 },
  { date: '06/01', views: 156 },
  { date: '07/01', views: 201 },
];

const mockStats = [
  { 
    label: 'Vues du profil', 
    value: 1234, 
    change: 12, 
    icon: Eye,
    color: 'text-blue-600'
  },
  { 
    label: 'Clics "Appeler"', 
    value: 89, 
    change: 8, 
    icon: Phone,
    color: 'text-green-600'
  },
  { 
    label: 'Clics "Itinéraire"', 
    value: 156, 
    change: -3, 
    icon: Navigation,
    color: 'text-orange-600'
  },
  { 
    label: 'Clics site web', 
    value: 234, 
    change: 15, 
    icon: Globe,
    color: 'text-purple-600'
  },
];

interface GoogleInsightsChartsProps {
  connected: boolean;
}

export function GoogleInsightsCharts({ connected }: GoogleInsightsChartsProps) {
  if (!connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Statistiques de visibilité
          </CardTitle>
          <CardDescription>
            Connectez votre compte Google Business pour voir vos statistiques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p>Statistiques non disponibles</p>
            <p className="text-sm mt-1">Connectez votre fiche Google Business pour accéder aux données</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div className={`flex items-center gap-1 text-sm ${
                  stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change >= 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Évolution des vues
          </CardTitle>
          <CardDescription>
            Nombre de vues de votre fiche sur les 7 derniers jours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockViewsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs" 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            💡 Ces données sont des exemples. Connectez l'API Google Business pour voir vos vraies statistiques.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
