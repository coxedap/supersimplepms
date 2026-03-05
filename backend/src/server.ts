import app from './app';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 PMS 0.1 backend running on port ${PORT}`);
});
