import { InputError } from '../exceptions/InputError.js';
import tf from '@tensorflow/tfjs-node';

async function predictClassification(model, image) {
  try {
    const tensor = tf.node
      .decodeJpeg(image, 3)
      .resizeNearestNeighbor([224, 224])
      .expandDims()
      .toFloat()
      .div(255.0);

    const prediction = model.predict(tensor);
    const scores = await prediction.data();

    // Cari hasil dengan probabilitas tertinggi
    const maxIndex = scores.indexOf(Math.max(...scores)); // Index skor tertinggi
    const classNames = model.class_names; // Nama kelas langsung dari model
    const predLabelName = classNames[maxIndex]; // Nama penyakit berdasarkan index

    // Ambil deskripsi dari disease_info
    const diseaseInfo = model.disease_info; // Metadata deskripsi penyakit
    const info = diseaseInfo.get(predLabelName, {
      "penjelasan": "Tidak ada deskripsi.",
      "penyebab": "Tidak ada data.",
      "pengobatan": "Tidak ada data.",
      "pencegahan": "Tidak ada data."
    });

    // Format deskripsi untuk hasil prediksi
    const description = (
      `Penjelasan: ${info['penjelasan']}\n` +
      `Penyebab: ${info['penyebab']}\n` +
      `Pengobatan: ${info['pengobatan']}\n` +
      `Pencegahan: ${info['pencegahan']}`
    );

    // Hitung score prediksi
    const resultScore = Math.max(...scores) * 100; // Skor dalam persen

    return { resultScore, result: predLabelName , description };
  } catch (error) {
    throw new InputError('Terjadi kesalahan dalam melakukan prediksi');
  }
}

export default predictClassification;
