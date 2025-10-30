import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon, TrendingUp, Upload } from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Template {
  id: string;
  imageUrl: string;
  publicId: string;
  prompt: string;
  style?: string;
  category: string;
  tags: string[];
  isTrending: boolean;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

const Styles = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    prompt: '',
    style: '',
    category: '',
    tags: '',
    isTrending: false,
  });
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importProgress, setImportProgress] = useState<any>(null);

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await apiClient.get('/admin/templates');
      setTemplates(response.data.data.templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories?isActive=true');
      setCategories(response.data.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        // Update template
        const updateData = {
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        };
        await apiClient.put(
          `/admin/templates/${editingTemplate.id}`,
          updateData
        );
      } else {
        // Create new template
        if (!imageFile) {
          alert('Please select an image');
          return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('image', imageFile);
        formDataToSend.append('prompt', formData.prompt);
        formDataToSend.append('style', formData.style);
        formDataToSend.append('category', formData.category);
        formDataToSend.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim()).filter(Boolean)));

        await apiClient.post('/admin/templates', formDataToSend);
      }
      
      fetchTemplates();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this style?')) return;
    
    try {
      await apiClient.delete(`/admin/templates/${id}`);
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      prompt: template.prompt,
      style: template.style || '',
      category: template.category,
      tags: template.tags.join(', '),
      isTrending: template.isTrending,
    });
    setImagePreview(template.imageUrl);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setImageFile(null);
    setImagePreview('');
    setFormData({
      prompt: '',
      style: '',
      category: '',
      tags: '',
      isTrending: false,
    });
  };

  const handleImport = async () => {
    try {
      setImporting(true);
      setImportResult(null);
      setImportProgress(null);

      const items = JSON.parse(importJson);
      
      if (!Array.isArray(items)) {
        alert('JSON must be an array of items');
        setImporting(false);
        return;
      }

      // Get auth token from localStorage
      const token = localStorage.getItem('accessToken') || localStorage.getItem('adminToken');
      if (!token) {
        alert('Authentication token not found. Please login again.');
        setImporting(false);
        return;
      }

      const baseURL = apiClient.defaults.baseURL || '/api/v1';
      // Show initial progress immediately in loading state
      setImportProgress({ current: 0, total: items.length, success: 0, skipped: 0, failed: 0, currentItem: 'Starting…' });
      
      // Send POST request and read SSE stream
      fetch(`${baseURL}/admin/templates/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream'
        },
        cache: 'no-cache',
        body: JSON.stringify({ items })
      }).then(async response => {
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized - Please login again');
          }
          throw new Error(`Server error: ${response.status}`);
        }
        
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }
        
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            setImporting(false);
            fetchTemplates();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.trim().startsWith('data: ')) {
              try {
                const jsonStr = line.trim().substring(6);
                const data = JSON.parse(jsonStr);
                
                console.log('SSE data received:', data);
                
                if (data.type === 'progress') {
                  setImportProgress({
                    current: data.current,
                    total: data.total,
                    success: data.success,
                    skipped: data.skipped,
                    failed: data.failed,
                    currentItem: data.currentItem
                  });
                } else if (data.type === 'complete') {
                  setImportResult(data.result);
                  setImportJson('');
                  alert(`Import completed!\nSuccess: ${data.result.success}\nSkipped: ${data.result.skipped}\nFailed: ${data.result.failed}`);
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e, 'Line:', line);
              }
            }
          }
        }
      }).catch(error => {
        console.error('Error importing templates:', error);
        alert(`Import failed: ${error.message}`);
        setImporting(false);
      });
    } catch (error: any) {
      console.error('Error importing templates:', error);
      alert(`Import failed: ${error.message}`);
      setImporting(false);
    }
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setImportJson('');
    setImportResult(null);
    setImportProgress(null);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Styles</h1>
          <p className="text-gray-500 mt-2 text-base">Manage style templates for users</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Upload size={20} />
            Import
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Add Style
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 group"
          >
            <div className="relative aspect-square">
              <img
                src={template.imageUrl}
                alt={template.prompt}
                className="w-full h-full object-cover"
              />
              {template.isTrending && (
                <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold text-sm shadow-lg">
                  <TrendingUp size={16} />
                  Trending
                </div>
              )}
            </div>
            
            <div className="p-5">
              <div className="mb-3">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                  {template.category}
                </span>
              </div>
              
              <p className="text-gray-900 font-semibold mb-2 line-clamp-2">
                {template.prompt}
              </p>
              
              {template.style && (
                <p className="text-gray-600 text-sm mb-3">Style: {template.style}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span>👁️ {template.viewCount}</span>
                <span>❤️ {template.likeCount}</span>
              </div>
              
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(template)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium"
                >
                  <Edit size={18} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-4 sm:p-6 my-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingTemplate ? 'Edit Style' : 'Add Style'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              {!editingTemplate && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                    {imagePreview ? (
                      <div className="space-y-3">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-40 md:max-h-48 mx-auto rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview('');
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Click to upload image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          required
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prompt
                </label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Style (optional)
                </label>
                <input
                  type="text"
                  value={formData.style}
                  onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="e.g., Cyberpunk, Watercolor, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="portrait, fantasy, dark"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isTrending"
                  checked={formData.isTrending}
                  onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                  className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
                />
                <label htmlFor="isTrending" className="text-sm font-semibold text-gray-700">
                  Mark as Trending
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-semibold shadow-lg"
                >
                  {editingTemplate ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 my-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Import Styles
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Paste a JSON array of styles to import. Each item should have: title, fullPrompt, imageUrl, and categories.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  JSON Data
                </label>
                <textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-mono text-sm"
                  rows={12}
                  placeholder='[{"title": "...", "fullPrompt": "...", "imageUrl": "...", "categories": [...]}]'
                  disabled={importing}
                />
              </div>

              {importProgress && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      Processing: {importProgress.current} / {importProgress.total}
                    </span>
                    <span className="text-sm text-gray-600">
                      {Math.round((importProgress.current / importProgress.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    Current: <span className="font-medium">{importProgress.currentItem}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-bold text-green-600">{importProgress.success}</div>
                      <div className="text-gray-500">Success</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-yellow-600">{importProgress.skipped}</div>
                      <div className="text-gray-500">Skipped</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-red-600">{importProgress.failed}</div>
                      <div className="text-gray-500">Failed</div>
                    </div>
                  </div>
                </div>
              )}

              {importResult && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">Import Results</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">{importResult.success}</div>
                      <div className="text-sm text-green-600">Success</div>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-700">{importResult.skipped}</div>
                      <div className="text-sm text-yellow-600">Skipped</div>
                    </div>
                    <div className="bg-red-100 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-red-700">{importResult.failed}</div>
                      <div className="text-sm text-red-600">Failed</div>
                    </div>
                  </div>
                  {importResult.details && (
                    <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                      {importResult.details.skipped?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-yellow-700 mb-1">Skipped:</h4>
                          {importResult.details.skipped.map((item: any, idx: number) => (
                            <div key={idx} className="text-xs text-gray-600">
                              {item.title}: {item.reason}
                            </div>
                          ))}
                        </div>
                      )}
                      {importResult.details.failed?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-red-700 mb-1">Failed:</h4>
                          {importResult.details.failed.map((item: any, idx: number) => (
                            <div key={idx} className="text-xs text-gray-600">
                              {item.title}: {item.error}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseImportModal}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                  disabled={importing}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={importing || !importJson.trim()}
                >
                  {importing ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Styles;
