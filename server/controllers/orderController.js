import Order from '../models/Order.js';

// In-memory order storage fallback
let inMemoryOrders = [];
let orderCounter = 100;

export const createOrder = async (req, res) => {
  try {
    const { customer, items, totalAmount } = req.body;

    if (!customer || !customer.name || !customer.phone || !customer.tableOrAddress) {
      return res.status(400).json({ success: false, message: 'Please provide all customer details' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    }

    orderCounter += 1;
    const orderNumber = `PH-${orderCounter}`;

    const newOrderData = {
      orderNumber,
      customer,
      items,
      totalAmount, // WYSWYP amount (no hidden tax)
      paymentStatus: 'Pending',
      orderStatus: 'Received',
      createdAt: new Date()
    };

    let savedOrder;
    try {
      const orderDoc = new Order(newOrderData);
      savedOrder = await orderDoc.save();
    } catch (dbErr) {
      // In-memory fallback
      savedOrder = {
        _id: `ord-mem-${Date.now()}`,
        ...newOrderData
      };
      inMemoryOrders.unshift(savedOrder);
    }

    res.status(201).json({
      success: true,
      message: 'Order initialized successfully',
      data: savedOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    let orders = [];
    try {
      orders = await Order.find().sort({ createdAt: -1 });
      if (orders.length === 0 && inMemoryOrders.length > 0) {
        orders = inMemoryOrders;
      }
    } catch (dbErr) {
      orders = inMemoryOrders;
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    let updatedOrder;
    try {
      const order = await Order.findById(id);
      if (order) {
        if (orderStatus) order.orderStatus = orderStatus;
        if (paymentStatus) order.paymentStatus = paymentStatus;
        updatedOrder = await order.save();
      }
    } catch (dbErr) {
      // Search in memory
      const index = inMemoryOrders.findIndex(o => o._id === id);
      if (index !== -1) {
        if (orderStatus) inMemoryOrders[index].orderStatus = orderStatus;
        if (paymentStatus) inMemoryOrders[index].paymentStatus = paymentStatus;
        updatedOrder = inMemoryOrders[index];
      }
    }

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
