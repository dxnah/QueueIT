import { useState } from 'react';

const useNotificationFilter = (notifications = []) => {
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = notifications
    .filter(n => filterType === 'all' || n.type === filterType)
    .filter(n =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return { filterType, setFilterType, searchTerm, setSearchTerm, filtered };
};

export default useNotificationFilter;