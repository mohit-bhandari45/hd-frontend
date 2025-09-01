import React, { useEffect, useState } from 'react';
import { Trash2, Plus, FileText } from 'lucide-react';
import { api, CONTENT_ENDPOINT, GET_OWN_DETAILS_ENDPOINT } from '../lib/api';
import { useNavigate } from 'react-router-dom';

interface IContent {
  _id: string;
  title: string;
  body: string;
  tags?: string[];
  isPinned: boolean;
  author: string;
  createdAt: string;
  updatedAt: string;
}

interface IUser {
  _id: string;
  username: string;
  email: string;
  dob: string;
}

const Dashboard: React.FC = () => {
  const [notes, setNotes] = useState<IContent[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', body: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState({ title: '', body: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const navigate = useNavigate();

  const selectedNote = selectedNoteId ? notes.find(note => note._id === selectedNoteId) : null;

  const fetchUser = async () => {
    try {
      const res = await api.get(GET_OWN_DETAILS_ENDPOINT);
      if (res.status === 200) {
        setUser(res.data as IUser);
      }
    } catch (e) {
      console.log('Error fetching user:', e);
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  const fetchContent = async () => {
    try {
      const res = await api.get(CONTENT_ENDPOINT);
      if (res.status === 200) {
        setNotes(res.data as IContent[]);
      }
    } catch (e) {
      console.log('Error fetching content:', e);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchContent();
  }, []);

  const handleSignOut = () => {
    console.log('Signing out...');
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleCreateNote = async () => {
    if (!newNote.title.trim() && !newNote.body.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const noteData = {
        title: newNote.title.trim() || `Note ${notes.length + 1}`,
        body: newNote.body.trim()
      };

      const res = await api.post(CONTENT_ENDPOINT, noteData);
      
      if (res.status === 200) {
        await fetchContent();
        setNewNote({ title: '', body: '' });
        setShowCreateModal(false);
      }
    } catch (e) {
      console.error('Error creating note:', e);
      alert('Failed to create note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectNote = (note: IContent) => {
    if (hasUnsavedChanges) {
      const shouldDiscard = confirm('You have unsaved changes. Do you want to discard them?');
      if (!shouldDiscard) return;
    }
    
    setSelectedNoteId(note._id);
    setEditedNote({ title: note.title, body: note.body });
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  const handleEditNote = () => {
    if (selectedNote) {
      setEditedNote({ title: selectedNote.title, body: selectedNote.body });
      setIsEditing(true);
      setHasUnsavedChanges(false);
    }
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      const shouldDiscard = confirm('You have unsaved changes. Do you want to discard them?');
      if (!shouldDiscard) return;
    }
    
    setIsEditing(false);
    setHasUnsavedChanges(false);
    if (selectedNote) {
      setEditedNote({ title: selectedNote.title, body: selectedNote.body });
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNoteId || !editedNote.title.trim() && !editedNote.body.trim()) return;

    setIsSaving(true);
    try {
      const res = await api.patch(`${CONTENT_ENDPOINT}/${selectedNoteId}`, {
        title: editedNote.title.trim() || 'Untitled',
        body: editedNote.body.trim()
      });

      if (res.status === 200) {
        setNotes(notes.map(note => 
          note._id === selectedNoteId 
            ? { ...note, title: editedNote.title || 'Untitled', body: editedNote.body, updatedAt: new Date().toISOString() }
            : note
        ));
        setIsEditing(false);
        setHasUnsavedChanges(false);
      }
    } catch (e) {
      console.error('Error updating note:', e);
      alert('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNoteChange = (field: 'title' | 'body', value: string) => {
    setEditedNote(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }
    try {
      const res = await api.delete(`${CONTENT_ENDPOINT}/${id}`);
      
      if (res.status === 200) {
        setNotes(notes.filter(note => note._id !== id));
        if (selectedNoteId === id) {
          setSelectedNoteId(null);
          setIsEditing(false);
          setHasUnsavedChanges(false);
        }
      }
    } catch (e) {
      console.error('Error deleting note:', e);
      alert('Failed to delete note. Please try again.');
    }
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setNewNote({ title: '', body: '' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-lg font-bold">HD</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Header */}
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">HD</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="text-blue-600 text-sm font-medium"
          >
            Sign Out
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Welcome Card */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome, {user.username}!
            </h2>
            <p className="text-gray-600 text-sm">Email: {user.email}</p>
          </div>

          {/* Create Note Button */}
          <button
            onClick={openCreateModal}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium text-lg hover:bg-blue-700 transition-colors"
          >
            Create Note
          </button>

          {/* Notes Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
            <div className="space-y-3">
              {notes.map((note) => (
                  <div
                    key={note._id}
                    onClick={() => handleSelectNote(note)}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{note.title}</h4>
                    {note.body && (
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {note.body}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note._id);
                    }}
                    className="ml-3 p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {notes.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FileText size={48} className="mx-auto mb-3 opacity-30" />
                  <p>No notes yet. Create your first note!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">HD</span>
                  </div>
                  <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-blue-600 text-sm font-medium hover:text-blue-800"
                >
                  Sign Out
                </button>
              </div>

              {/* Welcome Card */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Welcome, {user.username}!
                </h2>
                <p className="text-gray-600 text-sm">Email: {user.email}</p>
              </div>
            </div>

            {/* Create Note Button */}
            <div className="p-6">
              <button
                onClick={openCreateModal}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Plus size={20} className="mr-2" />
                Create Note
              </button>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div
                      key={note._id}
                      onClick={() => handleSelectNote(note)}
                      className={`bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer group ${
                        selectedNoteId === note._id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{note.title}</h4>
                          {note.body && (
                            <p className="text-xs text-gray-600 mt-1 truncate">
                              {note.body}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note._id);
                          }}
                          className="ml-2 p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-gray-50">
            {!selectedNote ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText size={64} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {notes.length === 0 ? 'No notes yet' : 'Select a note to view'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {notes.length === 0 
                      ? 'Create your first note to get started!' 
                      : 'Choose a note from the sidebar to view its contents'
                    }
                  </p>
                  {notes.length === 0 && (
                    <button
                      onClick={openCreateModal}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Create Note
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {/* Note Header */}
                <div className="bg-white border-b border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedNote.title}
                          onChange={(e) => handleNoteChange('title', e.target.value)}
                          className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none focus:ring-0 w-full"
                          placeholder="Untitled"
                        />
                      ) : (
                        <h1 className="text-2xl font-bold text-gray-900">
                          {selectedNote.title || 'Untitled'}
                        </h1>
                      )}
                      <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
                        <span>Created: {new Date(selectedNote.createdAt).toLocaleDateString()}</span>
                        <span>Modified: {new Date(selectedNote.updatedAt).toLocaleDateString()}</span>
                        {hasUnsavedChanges && (
                          <span className="text-orange-600 font-medium">● Unsaved changes</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            disabled={isSaving}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveNote}
                            disabled={isSaving || (!editedNote.title.trim() && !editedNote.body.trim())}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                          >
                            {isSaving ? 'Saving...' : 'Save'}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleEditNote}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Note Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {isEditing ? (
                    <textarea
                      value={editedNote.body}
                      onChange={(e) => handleNoteChange('body', e.target.value)}
                      className="w-full h-full resize-none border-none outline-none focus:ring-0 text-gray-800 text-lg leading-relaxed bg-transparent"
                      placeholder="Start writing your note..."
                    />
                  ) : (
                    <div className="prose prose-lg max-w-none">
                      {selectedNote.body ? (
                        <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                          {selectedNote.body}
                        </pre>
                      ) : (
                        <p className="text-gray-500 italic">This note is empty. Click Edit to add content.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Note Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Note</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="noteTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    id="noteTitle"
                    value={newNote.title}
                    onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter note title..."
                  />
                </div>
                
                <div>
                  <label htmlFor="noteContent" className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    id="noteContent"
                    value={newNote.body}
                    onChange={(e) => setNewNote({...newNote, body: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Write your note here..."
                  ></textarea>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={closeCreateModal}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNote}
                  disabled={isLoading || (!newNote.title.trim() && !newNote.body.trim())}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;