import { useState, useEffect } from 'react'
import { X, Image as ImageIcon, Wand2, Edit3, Calendar, Tag, Loader2 } from 'lucide-react'
import { dashboardService, GeneratedImage } from '../services/dashboardService'

const GeneratedImages = () => {
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchGeneratedImages()
  }, [page])

  const fetchGeneratedImages = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await dashboardService.getGeneratedImages(page, 50)
      setImages(data.images)
      setTotalPages(data.totalPages)
    } catch (err: any) {
      console.error('Failed to fetch generated images:', err)
      setError(err?.response?.data?.message || 'Failed to load generated images')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && images.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Generated Images</h1>
        <p className="text-gray-500 mt-2 text-base">
          All images generated or edited by users ({images.length > 0 && `Page ${page} of ${totalPages}`})
        </p>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {images.map((image) => (
          <div
            key={image.id}
            onClick={() => setSelectedImage(image)}
            className="relative group cursor-pointer overflow-hidden rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-all bg-white"
          >
            <div className="aspect-square overflow-hidden bg-gray-100">
              <img
                src={image.imageUrl}
                alt={image.prompt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            
            {/* Type Badge */}
            <div className="absolute top-2 right-2">
              <div className={`${
                image.type === 'generate' ? 'bg-blue-600' : 'bg-purple-600'
              } text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1`}>
                {image.type === 'generate' ? (
                  <>
                    <Wand2 size={12} />
                    Generate
                  </>
                ) : (
                  <>
                    <Edit3 size={12} />
                    Edit
                  </>
                )}
              </div>
            </div>

            {/* Overlay with prompt preview */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-sm font-medium line-clamp-2">{image.prompt}</p>
                {image.template?.style && (
                  <p className="text-white/80 text-xs mt-1">Style: {image.template.style}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Image Details</h2>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Image Display Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Before Image (for edits) */}
                {selectedImage.type === 'edit' && selectedImage.metadata.sourceImages && selectedImage.metadata.sourceImages.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <ImageIcon size={20} />
                      Before
                    </h3>
                    <div className="rounded-xl overflow-hidden border-2 border-gray-200">
                      <img
                        src={selectedImage.metadata.sourceImages[0]}
                        alt="Before"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}

                {/* After Image */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ImageIcon size={20} />
                    {selectedImage.type === 'edit' ? 'After' : 'Generated Image'}
                  </h3>
                  <div className="rounded-xl overflow-hidden border-2 border-gray-200">
                    <img
                      src={selectedImage.imageUrl}
                      alt="Result"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                {/* Type */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase">
                    {selectedImage.type === 'generate' ? <Wand2 size={16} /> : <Edit3 size={16} />}
                    Type
                  </div>
                  <p className="text-lg font-medium text-gray-900 capitalize">{selectedImage.type}</p>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase">
                    <Calendar size={16} />
                    Created
                  </div>
                  <p className="text-lg font-medium text-gray-900">{formatDate(selectedImage.createdAt)}</p>
                </div>

                {/* Style */}
                {selectedImage.template && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase">
                      <Tag size={16} />
                      Style
                    </div>
                    <div className="flex items-center gap-3">
                      {selectedImage.template.imageUrl && (
                        <img
                          src={selectedImage.template.imageUrl}
                          alt={selectedImage.template.style || 'Style'}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        />
                      )}
                      <p className="text-lg font-medium text-gray-900">
                        {selectedImage.template.style || 'Unknown Style'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {selectedImage.metadata.aspectRatio && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase">
                      Aspect Ratio
                    </div>
                    <p className="text-lg font-medium text-gray-900">{selectedImage.metadata.aspectRatio}</p>
                  </div>
                )}
              </div>

              {/* Prompt */}
              <div className="space-y-2 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase">
                  Prompt
                </div>
                <p className="text-base text-gray-900 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {selectedImage.prompt}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {images.length === 0 && !loading && (
        <div className="text-center text-gray-400 py-16">
          <ImageIcon size={64} className="mx-auto mb-4 opacity-20" />
          <p className="text-xl">No generated images yet</p>
        </div>
      )}
    </div>
  )
}

export default GeneratedImages
