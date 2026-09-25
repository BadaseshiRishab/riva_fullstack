const initialState = [];

const orderReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_ORDER': {
      if (!action.payload) return state;
      return [...state, action.payload];
    }
    case 'UPDATE_ORDER_STATUS': {
      const { id, status, returnStatus, returnRequested, returnReason, returnDecisionNote } = action.payload || {};
      if (!id) return state;

      return state.map((order) => {
        const orderId = order?.id ?? order?._id;
        if (String(orderId) !== String(id)) {
          return order;
        }

        return {
          ...order,
          ...(status !== undefined ? { status } : {}),
          ...(returnStatus !== undefined ? { returnStatus } : {}),
          ...(returnRequested !== undefined ? { returnRequested } : {}),
          ...(returnReason !== undefined ? { returnReason } : {}),
          ...(returnDecisionNote !== undefined ? { returnDecisionNote } : {}),
        };
      });
    }
    case 'CLEAR_ORDERS': {
      return [];
    }
    default:
      return state;
  }
};

export default orderReducer;
