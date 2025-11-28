const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const OrderItem = require('../models/OrderItem');
const Order = require('../models/Order');
const Size = require('../models/Size');
const Cloudinary = require('../cloudinary/clouddinary');
const Bluebird = require('bluebird');

/* =================== TÌM KIẾM + PHÂN TRANG =================== */

// Lấy danh sách sản phẩm + size
const searchProductSize = async (query, page, limit, sort) => {
  const products = await Product.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(sort)
    .lean();

  return Bluebird.map(
    products,
    async (product) => {
      const sizes = await Size.find({ product: product._id })
        .select('name numberInStock')
        .lean();
      return { ...product, sizes };
    },
    { concurrency: products.length || 1 }
  );
};

// Tạo query và trả về { products, total, pages, page }
const searchProductPage = async (
  search = '',
  subject = '',
  page = 1,
  limit = 50,
  sort = '-_id'
) => {
  const vPage = parseInt(page) || 1;
  const vLimit = parseInt(limit) || 50;

  const query = {};

  // Tìm theo text index
  if (search && search.trim() !== '') {
    query.$text = { $search: search.trim() };
  }

  // subject = '1' => lọc sản phẩm subject = true (ví dụ sản phẩm nổi bật)
  // subject = '0' hoặc không truyền => không lọc theo subject (lấy tất cả)
  if (subject === '1' || subject === 1 || subject === true) {
    query.subject = true;
  }

  const [products, total] = await Bluebird.all([
    searchProductSize(query, vPage, vLimit, sort),
    Product.countDocuments(query),
  ]);

  const pages = Math.max(1, Math.ceil(total / vLimit));

  return { products, total, pages, page: vPage };
};

// GET /products
const searchProduct = async (req, res, next) => {
  try {
    const {
      search = '',
      subject = '',
      page = 1,
      limit = 8,
      sort = '-_id',
    } = req.query;

    const products = await searchProductPage(
      search,
      subject,
      page,
      limit,
      sort
    );

    return res.status(200).json({
      success: true,
      products,          // { products, total, pages, page }
      searchTerm: search,
      status: 'ok',
    });
  } catch (error) {
    next(error);
  }
};

/* =================== CRUD SẢN PHẨM =================== */

const addProduct = async (req, res, next) => {
  try {
    console.log('call function add product');
    const { size, ...rest } = req.body;

    const product = await Product.create(rest);

    const sizeProudct = size.map((item) => ({
      ...item,
      product: product._id,
    }));

    await Size.create(sizeProudct);

    console.log('thêm thành công');
    const result = { ...product.toObject(), sizes: sizeProudct };

    return res
      .status(200)
      .json({ success: true, result, status: 'Bạn đã thêm sản phẩm thành công' });
  } catch (error) {
    next(error);
  }
};

const getProductId = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId).lean();
    if (!product) {
      return next(new Error('Không tìm thấy sản phẩm'));
    }

    // tăng view
    await Product.updateOne(
      { _id: req.params.productId },
      { $inc: { view: 1 } }
    ).exec();

    const size = await Size.find({ product: product._id })
      .select('-_id name numberInStock')
      .lean();

    const result = { ...product, size };
    return res
      .status(200)
      .json({ success: true, result, status: 'Lấy thành công' });
  } catch (error) {
    next(error);
  }
};

const getProductBin = async (req, res, next) => {
  try {
    console.log('call bin product');
    const products = await Product.findWithDeleted({ deleted: true }).lean();
    return res
      .status(200)
      .json({ success: true, products, total: products.length });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { _id } = { ...req.body };

    const orderItem = await OrderItem.find({ product: _id });

    await OrderItem.delete({ product: _id });
    await Order.delete({ _id: orderItem.order });
    await Cart.deleteMany({ product: { $in: _id } });
    await Wishlist.deleteMany({ product: { $in: _id } });
    await Product.delete({ _id });

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

const restoreProduct = async (req, res, next) => {
  try {
    const { _id } = { ...req.body };

    await Product.restore({ _id });
    await OrderItem.restore({ product: _id });

    const orderItemId = await OrderItem.find({ product: _id });
    await Order.restore({ _id: { $in: orderItemId.order } });

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

const editProduct = async (req, res, next) => {
  try {
    const { imagesDelete = [], formData } = { ...req.body };

    const {
      _id,
      name,
      category,
      description,
      sizes,
      images,
      price,
      originalPrice,
    } = { ...formData };

    // clear images cũ rồi set lại
    await Product.findByIdAndUpdate(
      _id,
      { $set: { images: [] } },
      { multi: true }
    );
    await Product.findByIdAndUpdate(_id, {
      $set: { name, category, description, images, price, originalPrice },
    });

    // cập nhật size
    await Size.deleteMany({ product: _id });

    const sizesUpdate = sizes.map((item) => ({
      ...item,
      product: _id,
    }));

    await Size.create(sizesUpdate);

    // xóa ảnh trên Cloudinary nếu có
    if (imagesDelete.length > 0) {
      await Cloudinary.delteImage(imagesDelete);
    } else {
      console.log('không có img xóa');
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addProduct,
  searchProduct,
  getProductId,
  deleteProduct,
  restoreProduct,
  getProductBin,
  editProduct,
};
