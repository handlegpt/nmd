# Directus CMS Setup for Nomad.Now

This document explains how to set up and use Directus CMS for managing content in the Nomad.Now project.

## 🚀 Quick Start

### 1. Prerequisites
- Docker and Docker Compose installed
- Supabase project with PostgreSQL database
- Node.js 18+ for development

### 2. Environment Setup
Copy the environment example and update with your values:
```bash
cp env.example .env.local
```

Update `.env.local` with your Supabase credentials:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Directus Configuration
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=your_directus_token
```

### 3. Start Directus
```bash
# Make script executable
chmod +x scripts/start-directus.sh

# Start Directus
./scripts/start-directus.sh
```

Or manually with Docker Compose:
```bash
docker-compose -f docker-compose.directus.yml up -d
```

### 4. Access Directus
- **Admin Panel**: http://localhost:8055/admin
- **API**: http://localhost:8055
- **Default Credentials**: admin@nomad.now / admin123

## 🏗️ Content Structure

### Cities Collection
```typescript
{
  id: string
  slug: string                    // URL-friendly identifier
  name: Record<string, string>    // Multi-language names
  description: Record<string, string> // Multi-language descriptions
  country: string
  timezone: string
  coordinates: { lat: number; lng: number }
  cost_of_living: string          // low, medium, high
  wifi_rating: string             // A+, A, B, C
  visa_requirements: Record<string, string>
  highlights: string[]            // Array of highlights
  images: string[]                // Array of image URLs
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}
```

### Places Collection
```typescript
{
  id: string
  name: string
  type: string                    // cafe, restaurant, coworking, etc.
  city_id: string                 // Reference to city
  category: string                // coffee, food, workspace, etc.
  rating: number                  // 1-5 rating
  price_range: string             // $, $$, $$$, $$$$
  address: string
  coordinates: { lat: number; lng: number }
  description: string
  features: string[]              // WiFi, Power, Quiet, etc.
  images: string[]                // Array of image URLs
  status: 'pending' | 'approved' | 'rejected'
  created_by: string              // User ID who created
  created_at: string
  updated_at: string
}
```

## 🔧 Configuration

### 1. Content Types Setup
In Directus Admin Panel:

1. **Go to Settings > Data Model**
2. **Create Collections** for Cities and Places
3. **Configure Fields** according to the structure above
4. **Set up Relationships** between collections
5. **Configure Permissions** for different user roles

### 2. Multi-language Setup
1. **Enable i18n** in collection settings
2. **Configure locales**: en, zh, ja, es
3. **Set default locale** to English
4. **Configure translatable fields**

### 3. File Storage
1. **Configure Storage Adapter** (S3, Cloudinary, or local)
2. **Set up image transformations** for thumbnails
3. **Configure file permissions**

## 📱 Frontend Integration

### 1. Using Directus Service
```typescript
import { useCities, usePlacesByCity } from '@/hooks/useDirectusData'

// Get cities
const { cities, loading, error } = useCities()

// Get places by city
const { places, loading, error } = usePlacesByCity(cityId)
```

### 2. API Calls
```typescript
import directusService from '@/services/directusService'

// Get cities with locale
const cities = await directusService.getCities('en')

// Search places
const places = await directusService.searchPlaces('coffee', cityId)
```

### 3. Authentication
```typescript
// Set token for authenticated requests
directusService.setToken('your_directus_token')

// Create place (requires authentication)
const newPlace = await directusService.createPlace(placeData)
```

## 🔐 Permissions & Roles

### 1. Default Roles
- **Admin**: Full access to all collections
- **Editor**: Can create, read, update content
- **Contributor**: Can create and read own content
- **Public**: Read-only access to published content

### 2. Permission Configuration
```typescript
// Example permission structure
{
  cities: {
    create: ['admin', 'editor'],
    read: ['public'],
    update: ['admin', 'editor'],
    delete: ['admin']
  },
  places: {
    create: ['admin', 'editor', 'contributor'],
    read: ['public'],
    update: ['admin', 'editor', 'contributor'],
    delete: ['admin']
  }
}
```

## 🚀 Deployment

### 1. Production Environment
Update environment variables for production:
```bash
NEXT_PUBLIC_DIRECTUS_URL=https://your-domain.com
DIRECTUS_TOKEN=your_production_token
```

### 2. Docker Production
```bash
# Build production image
docker build -t nomad-directus:latest .

# Run with production config
docker run -d \
  -p 8055:8055 \
  -e NODE_ENV=production \
  -e DB_HOST=your_production_db \
  nomad-directus:latest
```

### 3. Railway Deployment
```bash
# Deploy to Railway
railway up

# Set environment variables in Railway dashboard
```

## 📊 Monitoring & Maintenance

### 1. Health Checks
```bash
# Check service status
curl http://localhost:8055/health

# View logs
docker-compose -f docker-compose.directus.yml logs
```

### 2. Backup & Restore
```bash
# Backup database
docker exec nomad-directus pg_dump -U postgres postgres > backup.sql

# Restore database
docker exec -i nomad-directus psql -U postgres postgres < backup.sql
```

### 3. Updates
```bash
# Update Directus
docker-compose -f docker-compose.directus.yml pull
docker-compose -f docker-compose.directus.yml up -d
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check Supabase credentials
   - Verify database is accessible
   - Check firewall settings

2. **Permission Denied**
   - Verify user roles and permissions
   - Check collection access settings
   - Verify API token validity

3. **File Upload Issues**
   - Check storage adapter configuration
   - Verify file permissions
   - Check disk space

### Debug Commands
```bash
# Check container status
docker ps

# View detailed logs
docker-compose -f docker-compose.directus.yml logs -f

# Access container shell
docker exec -it nomad-directus sh

# Check environment variables
docker exec nomad-directus env
```

## 📚 Next Steps

1. **Set up content types** in Directus Admin Panel
2. **Configure multi-language support**
3. **Set up user roles and permissions**
4. **Import initial data** (cities, places)
5. **Test frontend integration**
6. **Configure production deployment**

## 🔗 Useful Links

- [Directus Documentation](https://docs.directus.io/)
- [Directus GitHub](https://github.com/directus/directus)
- [Directus Community](https://community.directus.io/)
- [Supabase Documentation](https://supabase.com/docs)

## 📞 Support

For issues related to:
- **Directus Setup**: Check Directus documentation
- **Frontend Integration**: Check this project's issues
- **Database Issues**: Check Supabase documentation
- **General Questions**: Create an issue in this repository
