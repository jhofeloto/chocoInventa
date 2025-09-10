import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authMiddleware } from '../utils/middleware'
import { AnalyticsMetrics, AnalyticsResponse, GenerateReportRequest, ReportResponse, JWTPayload } from '../types'
import * as mockDb from '../utils/mockDb'

const analytics = new Hono()

// Enable CORS for all analytics routes
analytics.use('/*', cors())

// Temporary development mode - bypass auth for testing
// TODO: Re-enable authentication in production
/*
analytics.use('/*', authMiddleware)
analytics.use('/*', async (c, next) => {
  const payload = c.get('jwtPayload') as JWTPayload
  if (payload?.role !== 'admin') {
    return c.json({ success: false, message: 'Access denied. Admin role required.' }, 403)
  }
  await next()
})
*/

/**
 * GET /api/analytics/metrics
 * Get comprehensive platform analytics metrics
 */
analytics.get('/metrics', async (c) => {
  try {
    console.log('📊 [ANALYTICS] Generating comprehensive metrics...')
    
    // Get all data from mock database
    const projects = mockDb.getAllProjects()
    const users = mockDb.getAllUsers()
    const newsArticles = mockDb.getAllNews()
    const events = mockDb.getAllEvents()  
    const resources = mockDb.getAllResources()

    // Calculate overview metrics
    const overview = {
      total_projects: projects.length,
      total_users: users.length,
      total_news: newsArticles.length,
      total_events: events.length,
      total_resources: resources.length,
      active_projects: projects.filter(p => p.status === 'active').length,
      published_news: newsArticles.filter(n => n.status === 'published').length,
      upcoming_events: events.filter(e => e.status === 'published' && new Date(e.start_date) > new Date()).length,
      public_resources: resources.filter(r => r.status === 'published' && r.is_public).length,
    }

    // Projects analytics
    const projectsByStatus = {
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
    }

    const projectsByArea: Record<string, number> = {}
    const projectsByInstitution: Record<string, number> = {}
    projects.forEach(project => {
      if (project.area) {
        projectsByArea[project.area] = (projectsByArea[project.area] || 0) + 1
      }
      if (project.institution) {
        projectsByInstitution[project.institution] = (projectsByInstitution[project.institution] || 0) + 1
      }
    })

    // Projects by month (last 12 months)
    const projectsByMonth = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStr = date.toISOString().slice(0, 7) // YYYY-MM format
      const count = projects.filter(p => p.created_at.startsWith(monthStr)).length
      projectsByMonth.push({
        month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        count
      })
    }

    // Users analytics
    const usersByRole = {
      admin: users.filter(u => u.role === 'admin').length,
      collaborator: users.filter(u => u.role === 'collaborator').length,
      researcher: users.filter(u => u.role === 'researcher').length,
    }

    const usersByInstitution: Record<string, number> = {}
    users.forEach(user => {
      if (user.institution) {
        usersByInstitution[user.institution] = (usersByInstitution[user.institution] || 0) + 1
      }
    })

    // News analytics
    const newsByStatus = {
      draft: newsArticles.filter(n => n.status === 'draft').length,
      published: newsArticles.filter(n => n.status === 'published').length,
      archived: newsArticles.filter(n => n.status === 'archived').length,
    }

    const newsByCategory: Record<string, number> = {}
    newsArticles.forEach(article => {
      if (article.category_name) {
        newsByCategory[article.category_name] = (newsByCategory[article.category_name] || 0) + 1
      }
    })

    const totalNewsViews = newsArticles.reduce((sum, article) => sum + article.views_count, 0)
    const mostViewedNews = newsArticles
      .filter(n => n.status === 'published')
      .sort((a, b) => b.views_count - a.views_count)
      .slice(0, 5)
      .map(article => ({
        id: article.id,
        title: article.title,
        views_count: article.views_count,
        category_name: article.category_name || 'Sin categoría'
      }))

    // Events analytics
    const eventsByStatus = {
      draft: events.filter(e => e.status === 'draft').length,
      published: events.filter(e => e.status === 'published').length,
      cancelled: events.filter(e => e.status === 'cancelled').length,
      completed: events.filter(e => e.status === 'completed').length,
    }

    const eventsByType: Record<string, number> = {}
    const eventsByCategory: Record<string, number> = {}
    events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1
      if (event.category_name) {
        eventsByCategory[event.category_name] = (eventsByCategory[event.category_name] || 0) + 1
      }
    })

    const totalEventRegistrations = events.reduce((sum, event) => sum + event.registrations_count, 0)
    const upcomingEventsCount = events.filter(e => 
      e.status === 'published' && new Date(e.start_date) > new Date()
    ).length

    const mostPopularEvents = events
      .filter(e => e.status === 'published')
      .sort((a, b) => b.registrations_count - a.registrations_count)
      .slice(0, 5)
      .map(event => ({
        id: event.id,
        title: event.title,
        registrations_count: event.registrations_count,
        views_count: event.views_count,
        start_date: event.start_date
      }))

    // Resources analytics
    const resourcesByStatus = {
      draft: resources.filter(r => r.status === 'draft').length,
      published: resources.filter(r => r.status === 'published').length,
      archived: resources.filter(r => r.status === 'archived').length,
    }

    const resourcesByType: Record<string, number> = {}
    const resourcesByCategory: Record<string, number> = {}
    resources.forEach(resource => {
      resourcesByType[resource.type] = (resourcesByType[resource.type] || 0) + 1
      resourcesByCategory[resource.category_name] = (resourcesByCategory[resource.category_name] || 0) + 1
    })

    const totalResourceDownloads = resources.reduce((sum, resource) => sum + resource.downloads_count, 0)
    const totalResourceViews = resources.reduce((sum, resource) => sum + resource.views_count, 0)
    
    const mostDownloadedResources = resources
      .filter(r => r.status === 'published')
      .sort((a, b) => b.downloads_count - a.downloads_count)
      .slice(0, 5)
      .map(resource => ({
        id: resource.id,
        title: resource.title,
        downloads_count: resource.downloads_count,
        views_count: resource.views_count,
        type: resource.type
      }))

    // Engagement metrics (simulated for demo)
    const engagement = {
      daily_active_users: Math.floor(users.length * 0.1),
      weekly_active_users: Math.floor(users.length * 0.3),
      monthly_active_users: Math.floor(users.length * 0.7),
      bounce_rate: 0.35,
      avg_session_duration: 420, // seconds
      page_views: {
        '/dashboard': 1250,
        '/portal': 890,
        '/noticias': 670,
        '/eventos': 540,
        '/recursos': 420,
        '/admin': 280
      }
    }

    // Build complete analytics metrics
    const metrics: AnalyticsMetrics = {
      overview,
      projects: {
        by_status: projectsByStatus,
        by_area: projectsByArea,
        by_institution: projectsByInstitution,
        by_month: projectsByMonth,
        recent_activity: projects
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map(p => ({
            id: p.id,
            title: p.title,
            created_at: p.created_at,
            status: p.status
          }))
      },
      users: {
        by_role: usersByRole,
        by_institution: usersByInstitution,
        active_users: users.filter(u => u.is_active).length,
        inactive_users: users.filter(u => !u.is_active).length,
        recent_registrations: users
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            created_at: u.created_at
          }))
      },
      news: {
        by_status: newsByStatus,
        by_category: newsByCategory,
        total_views: totalNewsViews,
        most_viewed: mostViewedNews,
        recent_articles: newsArticles
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map(n => ({
            id: n.id,
            title: n.title,
            status: n.status,
            views_count: n.views_count,
            created_at: n.created_at
          }))
      },
      events: {
        by_status: eventsByStatus,
        by_type: eventsByType,
        by_category: eventsByCategory,
        total_registrations: totalEventRegistrations,
        upcoming_count: upcomingEventsCount,
        most_popular: mostPopularEvents
      },
      resources: {
        by_status: resourcesByStatus,
        by_type: resourcesByType,
        by_category: resourcesByCategory,
        total_downloads: totalResourceDownloads,
        total_views: totalResourceViews,
        most_downloaded: mostDownloadedResources
      },
      engagement
    }

    const response: AnalyticsResponse = {
      success: true,
      data: metrics,
      generated_at: new Date().toISOString(),
      message: 'Analytics metrics generated successfully'
    }

    console.log('✅ [ANALYTICS] Metrics generated successfully')
    console.log(`📊 [ANALYTICS] Overview: ${overview.total_projects} projects, ${overview.total_users} users, ${overview.total_news} news, ${overview.total_events} events, ${overview.total_resources} resources`)
    
    return c.json(response)
  } catch (error) {
    console.error('❌ [ANALYTICS] Error generating metrics:', error)
    return c.json({ 
      success: false, 
      message: 'Error generating analytics metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * POST /api/analytics/reports
 * Generate downloadable reports
 */
analytics.post('/reports', async (c) => {
  try {
    const payload = c.get('jwtPayload') as JWTPayload
    const request = await c.req.json() as GenerateReportRequest
    
    console.log('📋 [ANALYTICS] Generating report:', request.report_type, 'format:', request.format)
    
    // Validate request
    if (!request.report_type || !request.format) {
      return c.json({
        success: false,
        message: 'Missing required fields: report_type and format'
      }, 400)
    }

    const validReportTypes = ['projects', 'users', 'news', 'events', 'resources', 'comprehensive']
    const validFormats = ['json', 'csv']

    if (!validReportTypes.includes(request.report_type)) {
      return c.json({
        success: false,
        message: 'Invalid report_type. Must be one of: ' + validReportTypes.join(', ')
      }, 400)
    }

    if (!validFormats.includes(request.format)) {
      return c.json({
        success: false,
        message: 'Invalid format. Must be one of: ' + validFormats.join(', ')
      }, 400)
    }

    // Generate report data based on type
    let reportData: any = {}
    const reportId = `${request.report_type}_${Date.now()}`
    
    switch (request.report_type) {
      case 'projects':
        reportData = {
          report_id: reportId,
          report_type: 'Projects Report',
          generated_by: payload.email,
          generated_at: new Date().toISOString(),
          data: mockDb.getAllProjects(),
          summary: {
            total_projects: mockDb.getAllProjects().length,
            active_projects: mockDb.getAllProjects().filter(p => p.status === 'active').length,
            completed_projects: mockDb.getAllProjects().filter(p => p.status === 'completed').length
          }
        }
        break
        
      case 'users':
        reportData = {
          report_id: reportId,
          report_type: 'Users Report', 
          generated_by: payload.email,
          generated_at: new Date().toISOString(),
          data: mockDb.getAllUsers().map(u => ({
            ...u,
            password: undefined // Remove password from report
          })),
          summary: {
            total_users: mockDb.getAllUsers().length,
            active_users: mockDb.getAllUsers().filter(u => u.is_active).length,
            by_role: {
              admin: mockDb.getAllUsers().filter(u => u.role === 'admin').length,
              collaborator: mockDb.getAllUsers().filter(u => u.role === 'collaborator').length,
              researcher: mockDb.getAllUsers().filter(u => u.role === 'researcher').length
            }
          }
        }
        break
        
      case 'news':
        reportData = {
          report_id: reportId,
          report_type: 'News Articles Report',
          generated_by: payload.email,
          generated_at: new Date().toISOString(),
          data: mockDb.getAllNews(),
          summary: {
            total_articles: mockDb.getAllNews().length,
            published: mockDb.getAllNews().filter(n => n.status === 'published').length,
            draft: mockDb.getAllNews().filter(n => n.status === 'draft').length,
            total_views: mockDb.getAllNews().reduce((sum, n) => sum + n.views_count, 0)
          }
        }
        break
        
      case 'events':
        reportData = {
          report_id: reportId,
          report_type: 'Events Report',
          generated_by: payload.email,
          generated_at: new Date().toISOString(),
          data: mockDb.getAllEvents(),
          summary: {
            total_events: mockDb.getAllEvents().length,
            published: mockDb.getAllEvents().filter(e => e.status === 'published').length,
            upcoming: mockDb.getAllEvents().filter(e => e.status === 'published' && new Date(e.start_date) > new Date()).length,
            total_registrations: mockDb.getAllEvents().reduce((sum, e) => sum + e.registrations_count, 0)
          }
        }
        break
        
      case 'resources':
        reportData = {
          report_id: reportId,
          report_type: 'Resources Report',
          generated_by: payload.email,
          generated_at: new Date().toISOString(),
          data: mockDb.getAllResources(),
          summary: {
            total_resources: mockDb.getAllResources().length,
            published: mockDb.getAllResources().filter(r => r.status === 'published').length,
            total_downloads: mockDb.getAllResources().reduce((sum, r) => sum + r.downloads_count, 0),
            total_views: mockDb.getAllResources().reduce((sum, r) => sum + r.views_count, 0)
          }
        }
        break
        
      case 'comprehensive':
        reportData = {
          report_id: reportId,
          report_type: 'Comprehensive Platform Report',
          generated_by: payload.email,
          generated_at: new Date().toISOString(),
          projects: mockDb.getAllProjects(),
          users: mockDb.getAllUsers().map(u => ({ ...u, password: undefined })),
          news: mockDb.getAllNews(),
          events: mockDb.getAllEvents(),
          resources: mockDb.getAllResources(),
          summary: {
            projects: mockDb.getAllProjects().length,
            users: mockDb.getAllUsers().length,
            news: mockDb.getAllNews().length,
            events: mockDb.getAllEvents().length,
            resources: mockDb.getAllResources().length
          }
        }
        break
    }

    // Convert to requested format
    let fileContent: string
    let mimeType: string
    let fileExtension: string

    if (request.format === 'json') {
      fileContent = JSON.stringify(reportData, null, 2)
      mimeType = 'application/json'
      fileExtension = 'json'
    } else if (request.format === 'csv') {
      // Simple CSV conversion (for demo purposes)
      if (request.report_type === 'comprehensive') {
        fileContent = 'Report Type,Total Count\n'
        fileContent += `Projects,${reportData.summary.projects}\n`
        fileContent += `Users,${reportData.summary.users}\n`
        fileContent += `News,${reportData.summary.news}\n`
        fileContent += `Events,${reportData.summary.events}\n`
        fileContent += `Resources,${reportData.summary.resources}\n`
      } else {
        // Convert array data to CSV
        const data = reportData.data || []
        if (data.length > 0) {
          const headers = Object.keys(data[0]).join(',')
          const rows = data.map((item: any) => 
            Object.values(item).map((val: any) => 
              typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
            ).join(',')
          ).join('\n')
          fileContent = headers + '\n' + rows
        } else {
          fileContent = 'No data available'
        }
      }
      mimeType = 'text/csv'
      fileExtension = 'csv'
    } else {
      throw new Error('Unsupported format')
    }

    // For demo purposes, we'll return the data directly
    // In production, you'd save to R2 storage and return a download URL
    const response: ReportResponse = {
      success: true,
      data: {
        report_id: reportId,
        report_type: request.report_type,
        format: request.format,
        generated_at: new Date().toISOString(),
        file_size: new Blob([fileContent]).size,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        // In production: download_url: `https://your-r2-bucket.com/reports/${reportId}.${fileExtension}`
      },
      message: 'Report generated successfully'
    }

    console.log('✅ [ANALYTICS] Report generated:', reportId, `(${new Blob([fileContent]).size} bytes)`)
    
    return c.json(response)
  } catch (error) {
    console.error('❌ [ANALYTICS] Error generating report:', error)
    return c.json({
      success: false,
      message: 'Error generating report',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * GET /api/analytics/charts/:type
 * Get specific chart data for visualizations
 */
analytics.get('/charts/:type', async (c) => {
  try {
    const chartType = c.req.param('type')
    console.log('📈 [ANALYTICS] Generating chart data for:', chartType)
    
    let chartData: any = {}
    
    switch (chartType) {
      case 'projects-overview':
        const projects = mockDb.getAllProjects()
        chartData = {
          type: 'doughnut',
          data: {
            labels: ['Activos', 'Completados'],
            datasets: [{
              label: 'Proyectos por Estado',
              data: [
                projects.filter(p => p.status === 'active').length,
                projects.filter(p => p.status === 'completed').length
              ],
              backgroundColor: ['#3B82F6', '#10B981'],
              borderColor: ['#2563EB', '#059669'],
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Proyectos por Estado'
              },
              legend: {
                display: true,
                position: 'bottom' as const
              }
            }
          }
        }
        break
        
      case 'users-roles':
        const users = mockDb.getAllUsers()
        chartData = {
          type: 'pie',
          data: {
            labels: ['Administradores', 'Colaboradores', 'Investigadores'],
            datasets: [{
              label: 'Usuarios por Rol',
              data: [
                users.filter(u => u.role === 'admin').length,
                users.filter(u => u.role === 'collaborator').length,
                users.filter(u => u.role === 'researcher').length
              ],
              backgroundColor: ['#EF4444', '#F59E0B', '#8B5CF6'],
              borderColor: ['#DC2626', '#D97706', '#7C3AED'],
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Distribución de Usuarios por Rol'
              },
              legend: {
                display: true,
                position: 'bottom' as const
              }
            }
          }
        }
        break
        
      case 'news-categories':
        const newsArticles = mockDb.getAllNews()
        const newsByCategory: Record<string, number> = {}
        newsArticles.forEach(article => {
          const category = article.category_name || 'Sin categoría'
          newsByCategory[category] = (newsByCategory[category] || 0) + 1
        })
        
        chartData = {
          type: 'bar',
          data: {
            labels: Object.keys(newsByCategory),
            datasets: [{
              label: 'Noticias por Categoría',
              data: Object.values(newsByCategory),
              backgroundColor: '#06B6D4',
              borderColor: '#0891B2',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Noticias por Categoría'
              },
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Cantidad de Noticias'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Categorías'
                }
              }
            }
          }
        }
        break
        
      case 'events-timeline':
        const events = mockDb.getAllEvents()
        const eventsByMonth: Record<string, number> = {}
        
        // Group events by month
        events.forEach(event => {
          const date = new Date(event.start_date)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          eventsByMonth[monthKey] = (eventsByMonth[monthKey] || 0) + 1
        })
        
        // Get last 6 months
        const months = []
        const data = []
        for (let i = 5; i >= 0; i--) {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          const monthLabel = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
          months.push(monthLabel)
          data.push(eventsByMonth[monthKey] || 0)
        }
        
        chartData = {
          type: 'line',
          data: {
            labels: months,
            datasets: [{
              label: 'Eventos por Mes',
              data: data,
              backgroundColor: '#A855F7',
              borderColor: '#9333EA',
              borderWidth: 3,
              fill: false,
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Tendencia de Eventos (Últimos 6 Meses)'
              },
              legend: {
                display: true,
                position: 'bottom' as const
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Número de Eventos'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Mes'
                }
              }
            }
          }
        }
        break
        
      case 'resources-downloads':
        const resources = mockDb.getAllResources()
        const topResources = resources
          .sort((a, b) => b.downloads_count - a.downloads_count)
          .slice(0, 5)
        
        chartData = {
          type: 'bar',
          data: {
            labels: topResources.map(r => r.title.length > 20 ? r.title.slice(0, 20) + '...' : r.title),
            datasets: [{
              label: 'Descargas',
              data: topResources.map(r => r.downloads_count),
              backgroundColor: '#10B981',
              borderColor: '#059669',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            indexAxis: 'y' as const,
            plugins: {
              title: {
                display: true,
                text: 'Top 5 Recursos Más Descargados'
              },
              legend: {
                display: false
              }
            },
            scales: {
              x: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Número de Descargas'
                }
              }
            }
          }
        }
        break
        
      default:
        return c.json({
          success: false,
          message: 'Invalid chart type'
        }, 400)
    }
    
    console.log('✅ [ANALYTICS] Chart data generated for:', chartType)
    return c.json({
      success: true,
      data: chartData,
      generated_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ [ANALYTICS] Error generating chart:', error)
    return c.json({
      success: false,
      message: 'Error generating chart data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export default analytics