import { ProjectCard } from './ProjectCard'
import { ProjectTable } from './ProjectTable'
import { Project } from './ProjectManagement'

interface ProjectListProps {
  projects: Project[]
  viewMode: 'grid' | 'table'
  onProjectClick: (project: Project) => void
  onEditProject: (project: Project) => void
  onDeleteProject: (projectId: string) => void
  userRole: string
  canEdit: (project: Project) => boolean
  canDelete: (project: Project) => boolean
}

export function ProjectList({
  projects,
  viewMode,
  onProjectClick,
  onEditProject,
  onDeleteProject,
  userRole,
  canEdit,
  canDelete
}: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <p className="text-lg mb-2">No projects found</p>
          <p className="text-sm">Try adjusting your filters or create a new project.</p>
        </div>
      </div>
    )
  }

  if (viewMode === 'table') {
    return (
      <ProjectTable
        projects={projects}
        onProjectClick={onProjectClick}
        onEditProject={onEditProject}
        onDeleteProject={onDeleteProject}
        userRole={userRole}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          onProjectClick={onProjectClick}
          onEditProject={onEditProject}
          onDeleteProject={onDeleteProject}
          canEdit={canEdit(project)}
          canDelete={canDelete(project)}
        />
      ))}
    </div>
  )
}