"use client";

import { useEffect, useState, Fragment } from "react";
import { getInvites, Invite, revokeInvite, getInviteLink } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Menu, Transition } from "@headlessui/react";
import {
  EllipsisVerticalIcon,
  ClipboardIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useToast } from "@/context/ToastContext";

export default function InvitesTablePage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const { addToast } = useToast();
  const pageSize = 5;

  const fetchInvites = async () => {
    try {
      const res = await getInvites();
      setInvites(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this invite?")) return;

    try {
      await revokeInvite(id);
      fetchInvites();
      addToast("Invite revoked successfully", "success");
    } catch {
      addToast("Failed to revoke invite", "error");
    }
  };

  const handleCopyLink = (token: string) => {
    const link = getInviteLink(token);
    navigator.clipboard.writeText(link);
    addToast(`Invite link copied: ${link}`);
  };

  // Filter + Paginate
  const filteredInvites = invites.filter((invite) =>
    invite.email.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredInvites.length / pageSize);
  const paginatedInvites = filteredInvites.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <ProtectedRoute allowed={["admin"]}>
      <div className="p-6 min-h-screen bg-yellow-gold">
        <h1 className="text-2xl font-bold mb-4 text-green-darkest">
          Manage Invites
        </h1>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-green-darkest rounded-md focus:outline-none focus:ring-0 text-green-darkest mb-4"
        />

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-green-dark text-left">
            <thead className="bg-green-darkest text-white">
              <tr>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Used</th>
                <th className="px-4 py-2">Expires At</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInvites.map((invite) => (
                <tr
                  key={invite._id}
                  className="border-t border-green-dark text-xs"
                >
                  <td className="px-4 py-2 text-green-darkest">
                    {invite.email}
                  </td>
                  <td className="px-4 py-2 text-green-darkest capitalize">
                    {invite.role}
                  </td>
                  <td className="px-4 py-2 text-green-darkest">
                    {invite.used ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-2 text-green-darkest">
                    {new Date(invite.expiresAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <Menu as="div" className="relative inline-block text-left">
                      <div>
                        <Menu.Button className="px-2 py-1 bg-green-darkest rounded-md hover:bg-green-dark">
                          <EllipsisVerticalIcon className="h-5 w-5" />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 mt-2 w-36 bg-green-darkest border border-green-darkest divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-50">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleCopyLink(invite._id)}
                                  className={`${
                                    active ? "text-lime-bright" : ""
                                  } flex w-full items-center px-4 py-2 text-sm text-yellow-gold`}
                                >
                                  <ClipboardIcon className="h-5 w-5 mr-2" />
                                  Copy Link
                                </button>
                              )}
                            </Menu.Item>
                            {!invite.used && (
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleRevoke(invite._id)}
                                    className={`${
                                      active ? "text-green-darkest" : ""
                                    } flex w-full items-center px-4 py-2 text-sm text-red-600`}
                                  >
                                    <TrashIcon className="h-5 w-5 mr-2" />
                                    Revoke
                                  </button>
                                )}
                              </Menu.Item>
                            )}
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center px-3 py-1 bg-green-darkest rounded disabled:opacity-50"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Previous
          </button>
          <span className="text-green-darkest font-bold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center px-3 py-1 bg-green-darkest rounded disabled:opacity-50"
          >
            Next
            <ChevronRightIcon className="h-5 w-5 ml-1" />
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
