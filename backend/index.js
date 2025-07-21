const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const courseRoutes = require('./routes/CourseRoute');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes'); // Đảm bảo bạn đã cập nhật đường dẫn này
require('dotenv').config();
const blogRoutes = require('./routes/BlogRoutes');
const eventRoutes = require('./routes/EventRoutes');
const quizRoutes = require('./routes/quizRoutes');
const questionRoutes = require('./routes/questionRoutes'); // Thêm dòng này
const categoriesRoutes = require('./routes/categories');
const assignedQuizRoutes = require('./routes/assignedQuizRoutes');
const classRoute = require('./routes/classRoute');
const dashboardRoutes = require('./routes/dashboard');
const resultRoutes = require('./routes/userQuizResultRoutes');
const eventRegistrationRoutes = require('./routes/eventRegistration');
const uploadRoute = require('./routes/uploadRoute');
const courseRegistrationRoutes = require('./routes/courseRegistrationRoutes');
const app = express();
const path = require('path');
// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS
app.use(cors({
    origin: true, // Cho phép tất cả origin (hoặc dùng array để giới hạn)
    credentials: true
  }));
  

// Xử lý preflight request
app.options('*', cors());

// Kết nối tới MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB Atlas connection error:', err));

// Sử dụng routes

app.use('/api/results', resultRoutes);
app.use('/api/course', courseRoutes);
app.use('/api', userRoutes); // Route cho user
app.use('/api/blog', blogRoutes); // Route cho blog
app.use('/api/events', eventRoutes); // Route cho blog
app.use('/api/quizzes', quizRoutes);
app.use('/api/questions', questionRoutes); // Thêm dòng này
app.use('/api/categories', categoriesRoutes);
app.use('/api/classes',classRoute);
app.use('/api/course-registrations', courseRegistrationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/event-registrations', eventRegistrationRoutes);
app.use('/api/assigned-quizzes', assignedQuizRoutes);
// Route upload media (mp3, mp4)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', uploadRoute);
// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log("🔍 MongoDB URI:", process.env.MONGODB_URI);

});