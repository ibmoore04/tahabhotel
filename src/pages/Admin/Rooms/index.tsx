// ==============================================================================
// TAHAB HOTEL & SUITES LTD — ADMIN ROOMS MANAGEMENT
// ==============================================================================

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Edit2,
} from 'lucide-react';
import { getRooms, updateRoom, createRoom } from '../../../services/api';
import type { Room, RoomCategory, RoomStatus } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import { Button } from '../../../components/common/Button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Modal } from '../../../components/common/Modal';
import { Skeleton, EmptyState } from '../../../components/common/Skeleton';
import { useToast } from '../../../contexts/ToastContext';

export const AdminRoomsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State for editing or creating
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    category: RoomCategory;
    tagline: string;
    description: string;
    price_per_night: number;
    capacity: number;
    bed_type: string;
    floor: number;
    status: RoomStatus;
    amenitiesStr: string;
    primaryImageUrl: string;
  }>({
    name: '',
    slug: '',
    category: 'standard',
    tagline: '',
    description: '',
    price_per_night: 35000,
    capacity: 2,
    bed_type: 'King Bed',
    floor: 1,
    status: 'available',
    amenitiesStr: '',
    primaryImageUrl: '',
  });

  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => getRooms(),
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: { id?: string; data: any }) => {
      const amenities = payload.data.amenitiesStr
        .split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean);

      const images = payload.data.primaryImageUrl
        ? [
            {
              id: `img-${Date.now()}`,
              room_id: payload.id || 'new',
              image_url: payload.data.primaryImageUrl,
              is_primary: true,
              sort_order: 1,
              created_at: new Date().toISOString(),
            },
          ]
        : editingRoom?.images || [];

      if (payload.id) {
        return updateRoom(
          payload.id,
          {
            name: payload.data.name,
            slug: payload.data.slug,
            category: payload.data.category,
            tagline: payload.data.tagline,
            description: payload.data.description,
            price_per_night: Number(payload.data.price_per_night),
            capacity: Number(payload.data.capacity),
            bed_type: payload.data.bed_type,
            floor: Number(payload.data.floor),
            status: payload.data.status,
          },
          amenities
        );
      } else {
        return createRoom({
          name: payload.data.name,
          slug: payload.data.slug || payload.data.name.toLowerCase().replace(/\s+/g, '-'),
          category: payload.data.category,
          tagline: payload.data.tagline,
          description: payload.data.description,
          price_per_night: Number(payload.data.price_per_night),
          capacity: Number(payload.data.capacity),
          bed_type: payload.data.bed_type,
          floor: Number(payload.data.floor),
          status: payload.data.status,
          amenities,
          image_urls: images.map((img: any) => img.image_url),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      showToast({
        type: 'success',
        title: 'Suite Saved',
        message: 'Room details updated successfully.',
      });
      setEditingRoom(null);
      setIsCreateOpen(false);
    },
    onError: (err: any) => {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err?.message || 'Could not save room.',
      });
    },
  });

  const handleEditClick = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      slug: room.slug,
      category: room.category,
      tagline: room.tagline || '',
      description: room.description,
      price_per_night: room.price_per_night,
      capacity: room.capacity,
      bed_type: room.bed_type,
      floor: room.floor,
      status: room.status,
      amenitiesStr: room.amenities.join('\n'),
      primaryImageUrl: room.images[0]?.image_url || '',
    });
  };

  const handleCreateClick = () => {
    setIsCreateOpen(true);
    setEditingRoom(null);
    setFormData({
      name: '',
      slug: '',
      category: 'standard',
      tagline: '',
      description: '',
      price_per_night: 45000,
      capacity: 2,
      bed_type: 'King Bed',
      floor: 1,
      status: 'available',
      amenitiesStr: 'King-sized Bed\nSplit Air Conditioning\nSmart TV\nModern Bathroom\nComplimentary Breakfast',
      primaryImageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      id: editingRoom?.id,
      data: formData,
    });
  };

  const toggleStatus = (room: Room) => {
    const nextStatus: RoomStatus =
      room.status === 'available' ? 'maintenance' : 'available';
    updateRoom(room.id, { status: nextStatus }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      showToast({
        type: 'info',
        title: 'Status Toggled',
        message: `${room.name} marked as ${nextStatus}.`,
      });
    });
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-emerald-950">
            Rooms & Suites Management
          </h1>
          <p className="text-xs text-stone-500">
            Create, edit, manage nightly rates, and toggle availability across all 3 hotel floors.
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleCreateClick}
        >
          Add New Suite
        </Button>
      </div>

      {/* Rooms Table */}
      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : rooms && rooms.length > 0 ? (
        <div className="bg-white border border-stone-200 rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase font-bold tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-4">Suite / Photo</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Capacity / Bed</th>
                  <th className="p-4">Price / Night</th>
                  <th className="p-4">Floor</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-warm-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            room.images[0]?.image_url ||
                            'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80'
                          }
                          alt={room.name}
                          className="w-12 h-10 object-cover rounded-sm border border-stone-200"
                        />
                        <div>
                          <span className="font-bold text-emerald-950 text-sm block">
                            {room.name}
                          </span>
                          <span className="text-[11px] text-stone-500 italic block">
                            {room.tagline || room.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 uppercase font-semibold text-stone-700">
                      {room.category}
                    </td>
                    <td className="p-4 text-stone-700">
                      <span>{room.bed_type}</span>
                      <span className="block text-[11px] text-stone-500">
                        Up to {room.capacity} Guests
                      </span>
                    </td>
                    <td className="p-4 font-serif font-bold text-emerald-950 text-sm">
                      {formatCurrency(room.price_per_night)}
                    </td>
                    <td className="p-4 font-semibold text-stone-700">
                      Floor {room.floor}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleStatus(room)}
                        title="Click to toggle status"
                        className="cursor-pointer"
                      >
                        <StatusBadge status={room.status} />
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1.5 text-stone-700 hover:text-emerald-950"
                        onClick={() => handleEditClick(room)}
                        title="Edit Suite"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No rooms found"
          description="Create your first room using the Add New Suite button."
        />
      )}

      {/* Edit / Create Modal */}
      {(editingRoom || isCreateOpen) && (
        <Modal
          isOpen={Boolean(editingRoom || isCreateOpen)}
          onClose={() => {
            setEditingRoom(null);
            setIsCreateOpen(false);
          }}
          title={editingRoom ? `Edit: ${editingRoom.name}` : 'Create New Hotel Suite'}
          maxWidth="2xl"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-stone-700">
                  Suite Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-stone-700">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as RoomCategory,
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500"
                >
                  <option value="standard">Standard / Mini Suite</option>
                  <option value="executive">Executive Suite</option>
                  <option value="presidential">Presidential Suite</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-stone-700">
                Tagline
              </label>
              <input
                type="text"
                placeholder="e.g. The Sweet Spot of Comfort"
                value={formData.tagline}
                onChange={(e) =>
                  setFormData({ ...formData, tagline: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-stone-700">
                  Price (₦ / Night) *
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={formData.price_per_night}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price_per_night: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-stone-700">
                  Max Guests
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-stone-700">
                  Bed Type
                </label>
                <input
                  type="text"
                  value={formData.bed_type}
                  onChange={(e) =>
                    setFormData({ ...formData, bed_type: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-stone-700">
                  Floor
                </label>
                <input
                  type="number"
                  min={1}
                  max={3}
                  value={formData.floor}
                  onChange={(e) =>
                    setFormData({ ...formData, floor: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-stone-700">
                Primary Image URL
              </label>
              <input
                type="url"
                value={formData.primaryImageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, primaryImageUrl: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-stone-700">
                Room Description *
              </label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-stone-700">
                Room Amenities & Features (One per line)
              </label>
              <textarea
                rows={3}
                value={formData.amenitiesStr}
                onChange={(e) =>
                  setFormData({ ...formData, amenitiesStr: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-warm-50 border border-stone-300 rounded-sm focus:outline-none focus:border-gold-500 font-mono"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingRoom(null);
                  setIsCreateOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gold"
                size="sm"
                isLoading={saveMutation.isPending}
              >
                Save Suite Details
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
