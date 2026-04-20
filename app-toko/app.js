async function ambilDataBarang() {
    const tabel = document.getElementById('tabel-barang');

    // Loading state
    tabel.innerHTML = `
        <tr>
            <td colspan="3" class="text-center p-5 text-gray-500">
                ⏳ Memuat data...
            </td>
        </tr>
    `;

    try {
        const response = await fetch('http://pbp.test/api-toko/get-barang.php');
        const hasil = await response.json();

        if (hasil.status === 'success') {

            if (hasil.data.length === 0) {
                tabel.innerHTML = `
                    <tr>
                        <td colspan="3" class="text-center p-5 text-gray-400">
                            Data kosong
                        </td>
                    </tr>
                `;
                return;
            }

            let barisHTML = '';

            hasil.data.forEach(barang => {
                barisHTML += `
                    <tr class="border-b hover:bg-gray-50 transition text-center">
                        <td class="p-3">${barang.id}</td>
                        <td class="p-3 font-medium">${barang.nama_barang}</td>
                        <td class="p-3 text-emerald-600 font-semibold">
                            Rp ${parseInt(barang.harga).toLocaleString('id-ID')}
                        </td>
                    </tr>
                `;
            });

            tabel.innerHTML = barisHTML;
        }

    } catch (error) {
        tabel.innerHTML = `
            <tr>
                <td colspan="3" class="text-center p-5 text-red-500">
                    ❌ Gagal mengambil data
                </td>
            </tr>
        `;
        console.error(error);
    }
}

ambilDataBarang();