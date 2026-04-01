export const INITIAL_ORDERS = [
    {
      id: 1,
      vaccine: 'Anti-Rabies',
      supplier: 'MedSource Philippines',
      amount: 200,
      pricePerPiece: 1100,
      total: 220000,
      status: 'Delivered',
      orderedAt: '2025-01-10T09:00:00.000Z',
    },
    {
      id: 2,
      vaccine: 'Booster',
      supplier: 'VaccinePro Asia',
      amount: 500,
      pricePerPiece: 1100,
      total: 550000,
      status: 'Pending',
      orderedAt: '2025-03-15T14:00:00.000Z',
    },
  ];
  
  export const ORDER_STATUS_OPTIONS = [
    'Pending',
    'Approved',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];