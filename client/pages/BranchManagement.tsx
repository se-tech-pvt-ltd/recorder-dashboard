import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Header } from "../components/Header";
import { cn } from "@/lib/utils";
import { authDelete } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Building2,
  MapPin,
  Phone,
  Mail,
  RefreshCw,
} from "lucide-react";

interface Branch {
  id: string;
  branch_code: string;
  branch_name: string;
  branch_city?: string;
  branch_address?: string;
  region?: string;
  contact_phone?: string;
  contact_email?: string;
  is_active: boolean;
  created_on: string;
  updated_on: string;
}

interface BranchFormData {
  branch_code: string;
  branch_name: string;
  branch_city: string;
  branch_address: string;
  region: string;
  contact_phone: string;
  contact_email: string;
}

export function BranchManagement() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<BranchFormData>({
    branch_code: "",
    branch_name: "",
    branch_city: "",
    branch_address: "",
    region: "",
    contact_phone: "",
    contact_email: "",
  });

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/branches?limit=50&search=${searchQuery}`,
      );
      if (!response.ok) throw new Error("Failed to fetch branches");
      const data = await response.json();
      setBranches(data.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingBranch
        ? `/api/branches/${editingBranch.id}`
        : "/api/branches";
      const method = editingBranch ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save branch");

      await fetchBranches();
      setShowAddModal(false);
      setShowEditModal(false);
      setEditingBranch(null);
      setFormData({
        branch_code: "",
        branch_name: "",
        branch_city: "",
        branch_address: "",
        region: "",
        contact_phone: "",
        contact_email: "",
      });
    } catch (error) {
      console.error("Error saving branch:", error);
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      branch_code: branch.branch_code,
      branch_name: branch.branch_name,
      branch_city: branch.branch_city || "",
      branch_address: branch.branch_address || "",
      region: branch.region || "",
      contact_phone: branch.contact_phone || "",
      contact_email: branch.contact_email || "",
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this branch?")) return;

    try {
      const response = await authDelete(`/api/branches/${id}`);

      if (!response.ok) throw new Error("Failed to delete branch");
      await fetchBranches();
    } catch (error) {
      console.error("Error deleting branch:", error);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-500">
              You need administrator privileges to view this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Branch Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your organization's branch locations and details
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center space-x-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Add Branch</span>
            </button>
          </div>

          {/* Filters & Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, code, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                />
              </div>
              <button
                onClick={fetchBranches}
                className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center space-y-3">
                <RefreshCw className="h-8 w-8 animate-spin text-red-500" />
                <p className="text-sm text-gray-500">Loading branches...</p>
              </div>
            </div>
          ) : branches.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No branches found
              </h3>
              <p className="text-gray-500 text-sm max-w-xs text-center mb-6">
                Get started by adding your first branch location to the system.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Branch</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full"
                >
                  <div className="p-5 flex-grow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                          <Building2 className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 leading-tight">
                            {branch.branch_name}
                          </h3>
                          <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                            {branch.branch_code}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Quick actions if needed */}
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-3 text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">
                          {branch.branch_address ? (
                            <>
                              {branch.branch_address}
                              {branch.branch_city && `, ${branch.branch_city}`}
                            </>
                          ) : (
                            branch.branch_city || "No address provided"
                          )}
                        </span>
                      </div>

                      {(branch.contact_phone || branch.contact_email) && (
                        <div className="pt-2 border-t border-gray-50 space-y-2">
                          {branch.contact_phone && (
                            <div className="flex items-center space-x-3 text-gray-600">
                              <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                              <span className="truncate">{branch.contact_phone}</span>
                            </div>
                          )}
                          {branch.contact_email && (
                            <div className="flex items-center space-x-3 text-gray-600">
                              <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                              <span className="truncate" title={branch.contact_email}>{branch.contact_email}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {branch.region && (
                        <div className="flex items-center space-x-2 text-xs text-gray-500 pt-1">
                          <span className="font-medium bg-gray-50 px-1.5 py-0.5 rounded">
                            {branch.region}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${branch.is_active
                          ? "bg-green-50 text-green-700 ring-green-600/20"
                          : "bg-red-50 text-red-700 ring-red-600/20"
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${branch.is_active ? 'bg-green-600' : 'bg-red-600'}`}></span>
                      {branch.is_active ? "Active" : "Inactive"}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEdit(branch)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit Branch"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(branch.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Branch"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-all scale-100">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingBranch ? "Edit Branch" : "Add New Branch"}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setEditingBranch(null);
                  }}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info Section */}
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                      <div className="w-1 h-4 bg-red-500 rounded-full mr-2"></div>
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          Branch Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.branch_code}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              branch_code: e.target.value,
                            })
                          }
                          placeholder="e.g. BR-001"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 sm:text-sm transition-shadow"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          Branch Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.branch_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              branch_name: e.target.value,
                            })
                          }
                          placeholder="e.g. Main Street Branch"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 sm:text-sm transition-shadow"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Section */}
                  <div className="md:col-span-2 pt-2 border-t border-gray-50">
                    <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                      <div className="w-1 h-4 bg-red-500 rounded-full mr-2"></div>
                      Location Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.branch_city}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              branch_city: e.target.value,
                            })
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 sm:text-sm transition-shadow"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          Region
                        </label>
                        <input
                          type="text"
                          value={formData.region}
                          onChange={(e) =>
                            setFormData({ ...formData, region: e.target.value })
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 sm:text-sm transition-shadow"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          Address
                        </label>
                        <textarea
                          value={formData.branch_address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              branch_address: e.target.value,
                            })
                          }
                          rows={2}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 sm:text-sm transition-shadow resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Section */}
                  <div className="md:col-span-2 pt-2 border-t border-gray-50">
                    <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                      <div className="w-1 h-4 bg-red-500 rounded-full mr-2"></div>
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.contact_phone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contact_phone: e.target.value,
                            })
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 sm:text-sm transition-shadow"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.contact_email}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contact_email: e.target.value,
                            })
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 sm:text-sm transition-shadow"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setEditingBranch(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm transition-colors"
                  >
                    {editingBranch ? "Save Changes" : "Create Branch"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
