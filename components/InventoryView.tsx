import React, { useState, useMemo } from 'react';
import type { Block, Room, Item } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SearchIcon } from './icons/SearchIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import Modal from './Modal';

type ModalType = 'addBlock' | 'editBlock' | 'addRoom' | 'editRoom' | 'addItem' | 'editItem' | 'deleteBlock' | 'deleteRoom' | 'deleteItem';

interface ModalState {
  type: ModalType | null;
  data?: any;
}

const InventoryView: React.FC<{ blocks: Block[], setBlocks: React.Dispatch<React.SetStateAction<Block[]>> }> = ({ blocks, setBlocks }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const [modalState, setModalState] = useState<ModalState>({ type: null });
  const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'itemCount'; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
  const [itemFilters, setItemFilters] = useState<{ [roomId: string]: { name: string; minQty: string; maxQty: string } }>({});

  const handleItemFilterChange = (roomId: string, filterType: 'name' | 'minQty' | 'maxQty', value: string) => {
    setItemFilters(prev => ({
      ...prev,
      [roomId]: {
        ...(prev[roomId] || { name: '', minQty: '', maxQty: '' }),
        [filterType]: value,
      },
    }));
  };

  const handleSort = (key: 'name' | 'itemCount') => {
    setSortConfig(prevConfig => {
        if (prevConfig.key === key) {
            return { key, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' };
        }
        return { key, direction: 'asc' };
    });
  };

  const filteredBlocks = useMemo(() => {
    let processedBlocks: Block[];

    if (!searchTerm) {
        processedBlocks = blocks;
    } else {
        const lowercasedFilter = searchTerm.toLowerCase();
        processedBlocks = blocks.map(block => {
            const filteredRooms = block.rooms.map(room => {
                const filteredItems = room.items.filter(item => item.name.toLowerCase().includes(lowercasedFilter));
                if (filteredItems.length > 0 || room.name.toLowerCase().includes(lowercasedFilter)) {
                    return { ...room, items: filteredItems };
                }
                return null;
            }).filter((room): room is Room => room !== null);

            if (filteredRooms.length > 0 || block.name.toLowerCase().includes(lowercasedFilter)) {
                return { ...block, rooms: filteredRooms };
            }
            return null;
        }).filter((block): block is Block => block !== null);
    }

    // Apply sorting to the (potentially filtered) blocks
    return processedBlocks.map(block => ({
        ...block,
        rooms: [...block.rooms].sort((a, b) => {
            if (sortConfig.key === 'name') {
                const comparison = a.name.localeCompare(b.name);
                return sortConfig.direction === 'asc' ? comparison : -comparison;
            } else { // 'itemCount'
                const comparison = a.items.length - b.items.length;
                return sortConfig.direction === 'asc' ? comparison : -comparison;
            }
        })
    }));
  }, [blocks, searchTerm, sortConfig]);

  const toggleBlock = (blockId: string) => {
    setExpandedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) newSet.delete(blockId);
      else newSet.add(blockId);
      return newSet;
    });
  };

  const toggleRoom = (roomId: string) => {
    setExpandedRooms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roomId)) newSet.delete(roomId);
      else newSet.add(roomId);
      return newSet;
    });
  };

  // CRUD Handlers
  const handleAddBlock = (name: string) => {
    const newBlock: Block = { id: `block-${Date.now()}`, name, rooms: [] };
    setBlocks(prev => [...prev, newBlock]);
    closeModal();
  };

  const handleEditBlock = (blockId: string, name: string) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, name } : b));
    closeModal();
  };
  
  const handleDeleteBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId));
    closeModal();
  };

  const handleAddRoom = (blockId: string, name: string) => {
    const newRoom: Room = { id: `room-${Date.now()}`, name, items: [] };
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, rooms: [...b.rooms, newRoom] } : b));
    closeModal();
  };

  const handleEditRoom = (blockId: string, roomId: string, name: string) => {
     setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, rooms: b.rooms.map(r => r.id === roomId ? {...r, name} : r) } : b));
     closeModal();
  };

  const handleDeleteRoom = (blockId: string, roomId: string) => {
     setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, rooms: b.rooms.filter(r => r.id !== roomId) } : b));
     closeModal();
  };

  const handleAddItem = (blockId: string, roomId: string, item: Omit<Item, 'id'>) => {
      const newItem: Item = { ...item, id: `item-${Date.now()}`};
      setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, rooms: b.rooms.map(r => r.id === roomId ? {...r, items: [...r.items, newItem]} : r) } : b));
      closeModal();
  };

  const handleEditItem = (blockId: string, roomId: string, item: Item) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, rooms: b.rooms.map(r => r.id === roomId ? {...r, items: r.items.map(i => i.id === item.id ? item : i)} : r) } : b));
    closeModal();
  };

  const handleDeleteItem = (blockId: string, roomId: string, itemId: string) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, rooms: b.rooms.map(r => r.id === roomId ? {...r, items: r.items.filter(i => i.id !== itemId)} : r) } : b));
    closeModal();
  };

  const openModal = (type: ModalType, data?: any) => setModalState({ type, data });
  const closeModal = () => setModalState({ type: null });

  const renderModalContent = () => {
    const { type, data } = modalState;
    if (!type) return null;

    if (type === 'addBlock' || type === 'editBlock') {
      const isEdit = type === 'editBlock';
      return (
        <form onSubmit={(e) => { e.preventDefault(); const name = (e.target as any).name.value; isEdit ? handleEditBlock(data.id, name) : handleAddBlock(name); }}>
          <h3 className="text-lg font-medium mb-4">{isEdit ? 'Edit Block' : 'Add New Block'}</h3>
          <input name="name" defaultValue={isEdit ? data.name : ''} placeholder="Block Name (e.g., Block D - Engineering)" required className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 mb-4"/>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-primary-500 text-white">{isEdit ? 'Save Changes' : 'Add Block'}</button>
          </div>
        </form>
      );
    }
    
    if (type === 'deleteBlock' || type === 'deleteRoom' || type === 'deleteItem') {
      const entity = type.replace('delete', '').toLowerCase();
      return (
        <div>
           <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
           <p className="mb-4">Are you sure you want to delete this {entity}? This action cannot be undone.</p>
           <div className="flex justify-end gap-2">
            <button onClick={closeModal} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600">Cancel</button>
            <button onClick={() => {
                if(type === 'deleteBlock') handleDeleteBlock(data.blockId)
                if(type === 'deleteRoom') handleDeleteRoom(data.blockId, data.roomId)
                if(type === 'deleteItem') handleDeleteItem(data.blockId, data.roomId, data.itemId)
            }} className="px-4 py-2 rounded bg-red-500 text-white">Delete</button>
           </div>
        </div>
      );
    }
    
    if (type === 'addRoom' || type === 'editRoom') {
        const isEdit = type === 'editRoom';
        return (
            <form onSubmit={(e) => { e.preventDefault(); const name = (e.target as any).name.value; isEdit ? handleEditRoom(data.blockId, data.room.id, name) : handleAddRoom(data.blockId, name); }}>
                <h3 className="text-lg font-medium mb-4">{isEdit ? 'Edit Room' : 'Add New Room'}</h3>
                <input name="name" defaultValue={isEdit ? data.room.name : ''} placeholder="Room Name (e.g., Robotics Lab)" required className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 mb-4"/>
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={closeModal} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded bg-primary-500 text-white">{isEdit ? 'Save Changes' : 'Add Room'}</button>
                </div>
            </form>
        );
    }

    if (type === 'addItem' || type === 'editItem') {
        const isEdit = type === 'editItem';
        return (
            <form onSubmit={(e) => { 
                e.preventDefault(); 
                const form = e.target as any;
                const quantity = parseInt(form.quantity.value, 10);
                const unitPrice = parseFloat(form.unitPrice.value);

                if (isNaN(quantity) || isNaN(unitPrice) || quantity < 0 || unitPrice < 0) {
                    alert('Quantity and Unit Price must be non-negative numbers.');
                    return;
                }

                const newItemData = { 
                    name: form.name.value, 
                    quantity,
                    unitPrice
                };

                if(isEdit) {
                    handleEditItem(data.blockId, data.roomId, {...newItemData, id: data.item.id});
                } else {
                    handleAddItem(data.blockId, data.roomId, newItemData);
                }
            }}>
                <h3 className="text-lg font-medium mb-4">{isEdit ? 'Edit Item' : 'Add New Item'}</h3>
                <div className="space-y-4">
                    <input name="name" defaultValue={isEdit ? data.item.name : ''} placeholder="Item Name" required className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
                    <input name="quantity" defaultValue={isEdit ? data.item.quantity : ''} placeholder="Quantity" type="number" min="0" required className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
                    <input name="unitPrice" defaultValue={isEdit ? data.item.unitPrice : ''} placeholder="Unit Price" type="number" min="0" step="0.01" required className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button type="button" onClick={closeModal} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded bg-primary-500 text-white">{isEdit ? 'Save Changes' : 'Add Item'}</button>
                </div>
            </form>
        )
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-auto flex-grow">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
            </span>
            <input
                type="text"
                placeholder="Search by block or room name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none dark:bg-gray-700 dark:text-white"
            />
            </div>
            <button
                onClick={() => openModal('addBlock')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg shadow hover:bg-primary-600 transition-colors duration-200 flex-shrink-0"
            >
                <PlusIcon />
                <span>Add Block</span>
            </button>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="font-medium text-sm text-gray-600 dark:text-gray-400">Sort rooms by:</span>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => handleSort('name')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-1 transition-colors duration-200 ${
                        sortConfig.key === 'name' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                    Name
                    {sortConfig.key === 'name' && (
                        <ChevronDownIcon className={`w-4 h-4 transform transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                </button>
                <button
                    onClick={() => handleSort('itemCount')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-1 transition-colors duration-200 ${
                        sortConfig.key === 'itemCount' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                    Item Count
                    {sortConfig.key === 'itemCount' && (
                        <ChevronDownIcon className={`w-4 h-4 transform transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                </button>
            </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredBlocks.map(block => (
          <div key={block.id} className="bg-white dark:bg-dark-card rounded-lg shadow-md overflow-hidden transition-all duration-300">
            <header
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 cursor-pointer"
              onClick={() => toggleBlock(block.id)}
            >
              <div className="flex items-center gap-3">
                <ChevronDownIcon className={`w-6 h-6 transform transition-transform duration-200 ${expandedBlocks.has(block.id) ? 'rotate-180' : ''}`} />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">{block.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                 <button title="Add Room" onClick={(e) => { e.stopPropagation(); openModal('addRoom', { blockId: block.id }); }} className="p-1.5 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-full"><PlusIcon/></button>
                 <button title="Edit Block" onClick={(e) => { e.stopPropagation(); openModal('editBlock', block); }} className="p-1.5 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full"><EditIcon /></button>
                 <button title="Delete Block" onClick={(e) => { e.stopPropagation(); openModal('deleteBlock', { blockId: block.id }); }} className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><TrashIcon /></button>
              </div>
            </header>
            
            {expandedBlocks.has(block.id) && (
              <div className="p-4 space-y-3">
                {block.rooms.map(room => {
                   const roomFilter = itemFilters[room.id];
                   const displayedItems = roomFilter
                     ? room.items.filter(item => {
                         const nameMatch = roomFilter.name ? item.name.toLowerCase().includes(roomFilter.name.toLowerCase()) : true;
                         const minQty = parseInt(roomFilter.minQty, 10);
                         const minQtyMatch = isNaN(minQty) || item.quantity >= minQty;
                         const maxQty = parseInt(roomFilter.maxQty, 10);
                         const maxQtyMatch = isNaN(maxQty) || item.quantity <= maxQty;
                         return nameMatch && minQtyMatch && maxQtyMatch;
                       })
                     : room.items;

                  return (
                  <div key={room.id} className="border dark:border-dark-border rounded-md">
                     <header
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 cursor-pointer"
                        onClick={() => toggleRoom(room.id)}
                     >
                        <div className="flex items-center gap-3">
                            <ChevronDownIcon className={`w-5 h-5 transform transition-transform duration-200 ${expandedRooms.has(room.id) ? 'rotate-180' : ''}`} />
                            <h4 className="font-medium text-gray-700 dark:text-gray-300">{room.name}</h4>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button title="Add Item" onClick={(e) => { e.stopPropagation(); openModal('addItem', { blockId: block.id, roomId: room.id }); }} className="p-1 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-full"><PlusIcon/></button>
                            <button title="Edit Room" onClick={(e) => { e.stopPropagation(); openModal('editRoom', { blockId: block.id, room: room }); }} className="p-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full"><EditIcon /></button>
                            <button title="Delete Room" onClick={(e) => { e.stopPropagation(); openModal('deleteRoom', { blockId: block.id, roomId: room.id }); }} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><TrashIcon /></button>
                        </div>
                     </header>
                    {expandedRooms.has(room.id) && (
                      <>
                        <div className="p-3 bg-gray-50 dark:bg-dark-card border-t border-b dark:border-dark-border">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="relative col-span-1 sm:col-span-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <SearchIcon />
                              </span>
                              <input
                                type="text"
                                placeholder="Filter by item name..."
                                value={itemFilters[room.id]?.name || ''}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => handleItemFilterChange(room.id, 'name', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                            <input
                              type="number"
                              placeholder="Min quantity"
                              value={itemFilters[room.id]?.minQty || ''}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleItemFilterChange(room.id, 'minQty', e.target.value)}
                              className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                              min="0"
                            />
                            <input
                              type="number"
                              placeholder="Max quantity"
                              value={itemFilters[room.id]?.maxQty || ''}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleItemFilterChange(room.id, 'maxQty', e.target.value)}
                              className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                              min="0"
                            />
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                              <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                                  <tr>
                                      <th scope="col" className="px-6 py-3">Item Name</th>
                                      <th scope="col" className="px-6 py-3 text-center">Quantity</th>
                                      <th scope="col" className="px-6 py-3 text-right">Unit Price</th>
                                      <th scope="col" className="px-6 py-3 text-right">Total Value</th>
                                      <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {displayedItems.map(item => (
                                      <tr key={item.id} className="bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-gray-600 border-b dark:border-gray-700">
                                          <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.name}</th>
                                          <td className="px-6 py-4 text-center">{item.quantity}</td>
                                          <td className="px-6 py-4 text-right">PKR {item.unitPrice.toFixed(2)}</td>
                                          <td className="px-6 py-4 text-right font-medium">PKR {(item.quantity * item.unitPrice).toFixed(2)}</td>
                                          <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                              <button title="Edit Item" onClick={() => openModal('editItem', { blockId: block.id, roomId: room.id, item: item })} className="p-1 text-blue-500 hover:text-blue-700"><EditIcon /></button>
                                              <button title="Delete Item" onClick={() => openModal('deleteItem', { blockId: block.id, roomId: room.id, itemId: item.id })} className="p-1 text-red-500 hover:text-red-700"><TrashIcon /></button>
                                            </div>
                                          </td>
                                      </tr>
                                  ))}
                                  {displayedItems.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-4 text-gray-500 dark:text-gray-400">
                                            {room.items.length > 0 ? 'No items match the current filter.' : 'This room is empty.'}
                                        </td>
                                    </tr>
                                  )}
                              </tbody>
                          </table>
                        </div>
                      </>
                     )}
                  </div>
                )})}
                {block.rooms.length === 0 && (
                    <p className="text-center py-4 text-gray-500 dark:text-gray-400">No rooms in this block.</p>
                )}
              </div>
            )}
          </div>
        ))}
         {filteredBlocks.length === 0 && (
            <div className="text-center py-10 bg-white dark:bg-dark-card rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">No results found for "{searchTerm}".</p>
            </div>
        )}
      </div>

       {modalState.type && (
        <Modal isOpen={!!modalState.type} onClose={closeModal}>
          {renderModalContent()}
        </Modal>
      )}

    </div>
  );
};

export default InventoryView;