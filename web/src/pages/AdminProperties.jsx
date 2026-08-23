import React, { useEffect, useState } from 'react';
import { adminPropertyService } from '../services/adminPropertyService';

export const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    propertyType: 'Apartment',
    price: '',
    address: '',
    city: '',
    bedrooms: '',
    bathrooms: '',
    furnished: false,
    status: 'published',
  });

  const loadProperties = async () => {
    try {
      setLoading(true);

      const result = await adminPropertyService.getProperties();

      setProperties(result.properties || []);
    } catch (error) {
      console.error('Failed to load admin properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const propertyData = {
        title: form.title,
        description: form.description,
        propertyType: form.propertyType,
        price: Number(form.price),

        location: {
          address: form.address,
          city: form.city,
        },

        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),

        furnished: form.furnished,

        status: form.status,

        amenities: [],
      };

      await adminPropertyService.createProperty(propertyData);

      alert('Property created successfully!');

      setForm({
        title: '',
        description: '',
        propertyType: 'Apartment',
        price: '',
        address: '',
        city: '',
        bedrooms: '',
        bathrooms: '',
        furnished: false,
        status: 'published',
      });

      setShowForm(false);

      await loadProperties();
    } catch (error) {
      console.error('Create property error:', error);

      alert(
        error.response?.data?.message ||
          'Failed to create property'
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Property Management
            </h1>

            <p className="text-slate-500 mt-2">
              Create and manage rental properties.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-3 rounded-lg bg-brand-500 text-white font-semibold hover:opacity-90"
          >
            {showForm ? 'Close Form' : '+ Add Property'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-6 mb-8">

            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
              Add New Property
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >

              <div>
                <label className="block mb-2 font-medium">
                  Property Title
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  minLength={5}
                  className="w-full border rounded-lg p-3"
                  placeholder="Modern 2 Bedroom Apartment"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Property Type
                </label>

                <select
                  name="propertyType"
                  value={form.propertyType}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3"
                >
                  <option>Apartment</option>
                  <option>House</option>
                  <option>Villa</option>
                  <option>Studio</option>
                  <option>Commercial</option>
                  <option>Penthouse</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 font-medium">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full border rounded-lg p-3"
                  placeholder="Describe the property..."
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Monthly Rent
                </label>

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full border rounded-lg p-3"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  City
                </label>

                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg p-3"
                  placeholder="Karachi"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Address
                </label>

                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg p-3"
                  placeholder="Main Clifton Road"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Bedrooms
                </label>

                <input
                  type="number"
                  name="bedrooms"
                  value={form.bedrooms}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full border rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Bathrooms
                </label>

                <input
                  type="number"
                  name="bathrooms"
                  value={form.bathrooms}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full border rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="unpublished">Unpublished</option>
                </select>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <input
                  type="checkbox"
                  name="furnished"
                  checked={form.furnished}
                  onChange={handleChange}
                  className="w-5 h-5"
                />

                <label className="font-medium">
                  Furnished
                </label>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-brand-500 text-white font-bold hover:opacity-90"
                >
                  Create Property
                </button>
              </div>

            </form>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-hidden">

          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">
              Existing Properties
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              Loading properties...
            </div>
          ) : properties.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No properties created yet.
            </div>
          ) : (
            <div className="divide-y">

              {properties.map((property) => (
                <div
                  key={property._id}
                  className="p-5 flex items-center justify-between"
                >

                  <div>
                    <h3 className="font-bold text-lg">
                      {property.title}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {property.location?.city} ·{' '}
                      {property.propertyType}
                    </p>

                    <p className="font-semibold mt-1">
                      Rs. {Number(property.price).toLocaleString()}
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full text-sm bg-slate-100">
                    {property.status}
                  </span>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};