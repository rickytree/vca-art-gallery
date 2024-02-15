import { Footer } from '@/src/components/common/footer'
import { Nav } from '@/src/components/common/nav'
import { GET_USER_AB_PROJECTS } from '@/src/lib/database/tokens'
import { artblocks_object_mapper } from '@/src/lib/helpers/artwork'
import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import EditIcon from '../../../components/ui/Icons/edit.svg'
import { EditProjectShellModal } from '@/src/components/artwork/artblocks/projectshell_editmodal'
import { useRouter } from 'next/router'

const ArtblocksManagement = () => {
  const [userProjects, setUserProjects] = useState<ArtblocksProject[]>([])
  const [openEditModal, setOpenEditModal] = useState<boolean>(false)
  const [editingProjectId, setEditingProjectId] = useState<number>(0)

  const { address } = useAccount()

  const router = useRouter()

  /* useEffect(() => {
    // redirect to main
    router.push('/')
  }, []) */

  // get artblocks projects for user address
  const {
    loading,
    error,
    data: projects,
  } = useQuery(GET_USER_AB_PROJECTS, {
    variables: {
      user_address: address,
    },
  })

  useEffect(() => {
    if (
      projects?.vca_main_ab_projects &&
      projects?.vca_main_ab_projects.length > 0 &&
      address
    ) {
      let projectsArr = projects.vca_main_ab_projects
      projectsArr = artblocks_object_mapper(projectsArr)
      setUserProjects(projectsArr)
    }
  }, [projects])

  const handleOpenModal = (id: number) => {
    setOpenEditModal(true)
    setEditingProjectId(id)
  }

  return (
    <div className="max-w-7xl mx-auto px-8 p-10 min-h-screen">
      {userProjects.length > 0 && (
        <>
          <h2 className="text-xl font-medium mb-8 mt-8">
            Your current projects
          </h2>
          <div className="flex gap-x-4 gap-y-4">
            {userProjects.map((project: ArtblocksProject) => (
              <div className="relative rounded-xl border-gray-700 border p-4 w-[16rem] flex flex-col justify-between gap-y-8">
                <img
                  src={EditIcon.src}
                  className="w-6 h-6 absolute top-4 right-4 cursor-pointer"
                  onClick={() => handleOpenModal(project.project_id)}
                />
                <div className="flex flex-col">
                  <span className="font-mono text-xs uppercase text-gray-800">
                    Project ID
                  </span>
                  <span className="text-3xl">{project.project_id}</span>
                </div>
                <span>{project.title}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {openEditModal && editingProjectId >= 0 && (
        <EditProjectShellModal project_id={editingProjectId} />
      )}
    </div>
  )
}

export default ArtblocksManagement
