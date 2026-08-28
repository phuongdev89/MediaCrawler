# 🔥 MediaCrawler - Công cụ Thu thập Dữ liệu Mạng Xã hội 🕷️

<div align="center">

### 🤝 Lời cảm ơn đặc biệt đến Nhà tài trợ Vàng của chúng tôi

<a href="https://www.browseract.ai/mediacrawler" target="_blank">
  <img src="docs/static/images/browseract_ad.jpg" alt="BrowserAct" width="600">
</a>

<br>

<a href="https://www.browseract.ai/mediacrawler" target="_blank">
<small>BrowserAct cho phép bạn trích xuất dữ liệu từ bất kỳ trang web nào chỉ với một câu lệnh. Không cần viết mã—xây dựng một lần, tái sử dụng ổn định và tiêu tốn rất ít token. BrowserAct sử dụng trình duyệt thực để tự động xây dựng Bot thu thập dữ liệu, tích hợp sẵn duyệt web ẩn danh, xử lý CAPTCHA và proxy dân cư, sau đó xuất trực tiếp kết quả có cấu trúc. Hãy dùng thử miễn phí ngay bây giờ.</small>
</a>

</div>

---

<div align="center">

<a href="https://trendshift.io/repositories/8291" target="_blank">
  <img src="https://trendshift.io/api/badge/repositories/8291" alt="NanmiCoder%2FMediaCrawler | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/>
</a>

[![GitHub Stars](https://img.shields.io/github/stars/NanmiCoder/MediaCrawler?style=social)](https://github.com/NanmiCoder/MediaCrawler/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/NanmiCoder/MediaCrawler?style=social)](https://github.com/NanmiCoder/MediaCrawler/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/NanmiCoder/MediaCrawler)](https://github.com/NanmiCoder/MediaCrawler/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/NanmiCoder/MediaCrawler)](https://github.com/NanmiCoder/MediaCrawler/pulls)
[![License](https://img.shields.io/github/license/NanmiCoder/MediaCrawler)](https://github.com/NanmiCoder/MediaCrawler/blob/main/LICENSE)
[![中文](https://img.shields.io/badge/🇨🇳_中文-Available-blue)](README.md)
[![English](https://img.shields.io/badge/🇺🇸_English-Available-blue)](README_en.md)
[![Español](https://img.shields.io/badge/🇪🇸_Español-Available-blue)](README_es.md)
[![Tiếng Việt](https://img.shields.io/badge/🇻🇳_Tiếng_Việt-Current-green)](README_vi.md)

</div>

> **Tuyên bố miễn trừ trách nhiệm:**
> 
> Vui lòng chỉ sử dụng kho lưu trữ này cho mục đích học tập ⚠️⚠️⚠️⚠️, [Các vụ án thu thập dữ liệu web trái phép](https://github.com/HiddenStrawberry/Crawler_Illegal_Cases_In_China)  <br>
>
>Tất cả nội dung trong kho lưu trữ này chỉ nhằm mục đích học tập và tham khảo, nghiêm cấm sử dụng cho mục đích thương mại. Không cá nhân hoặc tổ chức nào được sử dụng nội dung của kho lưu trữ này cho các mục đích bất hợp pháp hoặc xâm phạm quyền và lợi ích hợp pháp của người khác. Công nghệ thu thập dữ liệu web được đề cập trong kho lưu trữ này chỉ phục vụ cho việc học tập và nghiên cứu, không được sử dụng để thu thập dữ liệu quy mô lớn từ các nền tảng khác hoặc các hoạt động bất hợp pháp khác. Kho lưu trữ này không chịu bất kỳ trách nhiệm pháp lý nào phát sinh từ việc sử dụng nội dung của kho lưu trữ này. Bằng việc sử dụng nội dung của kho lưu trữ này, bạn đồng ý với tất cả các điều khoản và điều kiện của tuyên bố miễn trừ trách nhiệm này.
>
> Nhấp để xem tuyên bố miễn trừ trách nhiệm chi tiết hơn. [Nhấp để chuyển đến](#tuyen-bo-mien-tru-trach-nhiem)

## 📖 Giới thiệu Dự án

Một **công cụ thu thập dữ liệu mạng xã hội đa nền tảng** mạnh mẽ, hỗ trợ thu thập thông tin công khai từ các nền tảng phổ biến bao gồm Xiaohongshu (Tiểu Hồng Thư), Douyin (TikTok Trung Quốc), Kuaishou, Bilibili, Weibo, Tieba, Zhihu, v.v.

### 🔧 Nguyên lý Kỹ thuật

- **Công nghệ Cốt lõi**: Dựa trên framework tự động hóa trình duyệt [Playwright](https://playwright.dev/) để đăng nhập và duy trì trạng thái đăng nhập
- **Không yêu cầu dịch ngược JS (No JS Reverse Engineering)**: Sử dụng môi trường ngữ cảnh trình duyệt có lưu trạng thái đăng nhập để lấy các tham số chữ ký thông qua biểu thức JS
- **Ưu điểm**: Không cần dịch ngược các thuật toán mã hóa phức tạp, giảm đáng kể rào cản kỹ thuật

## ✨ Tính năng
| Nền tảng | Tìm kiếm theo Từ khóa | Thu thập theo ID bài viết cụ thể | Bình luận cấp 2 | Trang cá nhân tác giả cụ thể | Bộ nhớ đệm trạng thái đăng nhập | IP Proxy Pool | Tạo đám mây từ bình luận (Word Cloud) |
| ------ | ---------- | -------------- | -------- | -------------- | ---------- | -------- | -------------- |
| Xiaohongshu | ✅          | ✅              | ✅        | ✅              | ✅          | ✅        | ✅              |
| Douyin   | ✅          | ✅              | ✅        | ✅              | ✅          | ✅        | ✅              |
| Kuaishou   | ✅          | ✅              | ✅        | ✅              | ✅          | ✅        | ✅              |
| Bilibili   | ✅          | ✅              | ✅        | ✅              | ✅          | ✅        | ✅              |
| Weibo   | ✅          | ✅              | ✅        | ✅              | ✅          | ✅        | ✅              |
| Tieba   | ✅          | ✅              | ✅        | ✅              | ✅          | ✅        | ✅              |
| Zhihu   | ✅          | ✅              | ✅        | ✅              | ✅          | ✅        | ✅              |


<strong>MediaCrawlerPro Bản phát hành lớn! Mã nguồn mở không hề dễ dàng, hoan nghênh đăng ký và ủng hộ!</strong>

> Tập trung vào việc học hỏi thiết kế kiến trúc dự án trưởng thành, không chỉ là kỹ thuật thu thập dữ liệu. Triết lý thiết kế mã nguồn của phiên bản Pro rất đáng để nghiên cứu sâu sắc!

Ưu điểm cốt lõi của [MediaCrawlerPro](https://github.com/MediaCrawlerPro) so với phiên bản mã nguồn mở:

#### 🎯 Nâng cấp Tính năng Cốt lõi
- ✅ **Agent Phân tích Nội dung (Content Deconstruction Agent)** (Tính năng mới)
- ✅ **Tính năng tiếp tục thu thập khi bị gián đoạn (Resume crawling)** (Tính năng quan trọng)
- ✅ **Hỗ trợ đa tài khoản + IP proxy pool** (Tính năng quan trọng)
- ✅ **Loại bỏ phụ thuộc Playwright**, sử dụng dễ dàng hơn
- ✅ **Hỗ trợ hoàn chỉnh môi trường Linux**

#### 🏗️ Tối ưu hóa Thiết kế Kiến trúc
- ✅ **Tái cấu trúc và tối ưu mã nguồn**, dễ đọc và dễ bảo trì hơn (tách rời logic chữ ký JS)
- ✅ **Chất lượng mã nguồn cấp doanh nghiệp**, phù hợp để xây dựng các dự án crawler quy mô lớn
- ✅ **Thiết kế kiến trúc hoàn hảo**, khả năng mở rộng cao, giá trị học tập mã nguồn lớn hơn

#### 🎁 Tính năng Bổ sung
- ✅ **Ứng dụng máy tính tải video mạng xã hội** (thích hợp để học phát triển full-stack)
- ✅ **Gợi ý bảng tin trang chủ đa nền tảng** (HomeFeed)
- [ ] **AI Agent dựa trên phân tích bình luận đang được phát triển 🚀🚀**

Nhấp để xem: [Trang chủ Dự án MediaCrawlerPro](https://github.com/MediaCrawlerPro) để biết thêm thông tin

## 🚀 Bắt đầu Nhanh

> 💡 **Mã nguồn mở không hề dễ dàng, nếu dự án này giúp ích cho bạn, hãy tặng một ⭐ Star để ủng hộ nhé!**

## 📋 Yêu cầu Tiên quyết

### 🚀 Cài đặt uv (Khuyên dùng)

Trước khi tiếp tục các bước tiếp theo, vui lòng đảm bảo rằng uv đã được cài đặt trên máy tính của bạn:

- **Hướng dẫn Cài đặt**: [Hướng dẫn Cài đặt Chính thức của uv](https://docs.astral.sh/uv/getting-started/installation)
- **Kiểm tra Cài đặt**: Nhập lệnh `uv --version` trong terminal. Nếu số phiên bản hiển thị bình thường, việc cài đặt đã thành công
- **Lý do Khuyên dùng**: uv hiện là công cụ quản lý gói Python mạnh mẽ nhất, với tốc độ nhanh và khả năng phân giải phụ thuộc chính xác

### 🟢 Cài đặt Node.js

Dự án phụ thuộc vào Node.js, vui lòng tải xuống và cài đặt từ trang web chính thức:

- **Liên kết Tải xuống**: https://nodejs.org/en/download/
- **Yêu cầu Phiên bản**: >= 16.0.0

### 📦 Cài đặt Gói Python

```shell
# Di chuyển vào thư mục dự án
cd MediaCrawler

# Sử dụng lệnh uv sync để đảm bảo tính nhất quán của phiên bản python và các gói phụ thuộc liên quan
uv sync
```

### 🌐 Cài đặt Trình điều khiển Trình duyệt (Browser Driver)

```shell
# Cài đặt trình điều khiển trình duyệt
uv run playwright install
```

> **💡 Mẹo**: MediaCrawler hiện hỗ trợ sử dụng Playwright để kết nối với trình duyệt Chrome cục bộ của bạn, giải quyết một số vấn đề do Webdriver gây ra.
>
> Hiện tại, `xhs` và `dy` có thể sử dụng chế độ CDP để kết nối với trình duyệt cục bộ. Nếu cần, hãy kiểm tra các mục cấu hình trong `config/base_config.py`.

## 🚀 Chạy Chương trình Crawler

```shell
# Dự án mặc định không bật chế độ thu thập bình luận. Nếu bạn cần lấy bình luận, vui lòng sửa biến ENABLE_GET_COMMENTS trong config/base_config.py
# Các tùy chọn được hỗ trợ khác cũng có thể xem trong config/base_config.py kèm chú thích tiếng Trung

# Đọc từ khóa từ tệp cấu hình để tìm kiếm các bài viết liên quan và thu thập thông tin bài viết cùng bình luận
uv run main.py --platform xhs --lt qrcode --type search

# Đọc danh sách ID bài viết được chỉ định từ tệp cấu hình để lấy thông tin và bình luận của các bài viết chỉ định
uv run main.py --platform xhs --lt qrcode --type detail

# Mở ứng dụng tương ứng để quét mã QR đăng nhập

# Để xem ví dụ sử dụng crawler cho các nền tảng khác, thực thi lệnh sau để xem hướng dẫn
uv run main.py --help
```

## Hỗ trợ WebUI

<details>
<summary>🖥️ <strong>Giao diện Vận hành Trực quan WebUI</strong></summary>

MediaCrawler cung cấp giao diện vận hành trực quan trên nền web, cho phép bạn dễ dàng sử dụng các tính năng crawler mà không cần dòng lệnh.

#### Môi trường Phát triển (Khuyên dùng)

Để phát triển, bạn cần khởi chạy cả dịch vụ API backend và máy chủ phát triển Vite frontend:

```shell
# Terminal 1: khởi động API server (cổng mặc định 8080)
uv run uvicorn api.main:app --port 8080 --reload

# Terminal 2: khởi động máy chủ frontend dev
cd webui
npm install
npm run dev        # mặc định khởi chạy trên cổng 5173 và proxy /api tới 8080
```

Sau khi khởi động thành công, truy cập `http://localhost:5173/` để mở giao diện WebUI.

> Trong lần khởi chạy đầu tiên, quá trình kiểm tra môi trường sẽ được thực hiện (gọi `/api/env/check`), vì vậy hãy đảm bảo dịch vụ backend đang chạy. Nếu kiểm tra thất bại, bạn có thể nhấp vào "Bỏ qua kiểm tra" để tạm thời vượt qua.

#### Đóng gói cho Môi trường Thực tế (Production)

Nếu bạn muốn API server phục vụ trực tiếp các tài nguyên tĩnh WebUI, hãy build frontend trước:

```shell
cd webui
npm install
npm run build      # xuất kết quả ra api/webui/
```

Sau đó chỉ cần khởi động API server:

```shell
uv run uvicorn api.main:app --port 8080 --reload
```

Sau khi khởi động thành công, truy cập `http://localhost:8080` để mở giao diện WebUI.

#### Các tính năng của WebUI

- Trực quan hóa cấu hình tham số crawler (nền tảng, phương thức đăng nhập, loại thu thập, v.v.)
- Xem trạng thái hoạt động và nhật ký (log) của crawler theo thời gian thực
- Xem trước và xuất dữ liệu

#### Xem trước Giao diện

<img src="docs/static/images/img_8.png" alt="Xem trước Giao diện WebUI">

</details>

<details>
<summary>🔗 <strong>Sử dụng Quản lý Môi trường Ảo Python venv Gốc (Không khuyên dùng)</strong></summary>

#### Tạo và kích hoạt môi trường ảo Python

> Nếu thu thập Douyin và Zhihu, bạn cần cài đặt môi trường nodejs trước, phiên bản lớn hơn hoặc bằng: `16`

```shell
# Di chuyển vào thư mục gốc của dự án
cd MediaCrawler

# Tạo môi trường ảo
# Phiên bản python được sử dụng: 3.9.6, các thư viện trong requirements.txt dựa trên phiên bản này
# Nếu sử dụng các phiên bản python khác, các thư viện trong requirements.txt có thể không tương thích, vui lòng tự xử lý
python -m venv venv

# Kích hoạt môi trường ảo trên macOS & Linux
source venv/bin/activate

# Kích hoạt môi trường ảo trên Windows
venv\Scripts\activate
```

#### Cài đặt các thư viện phụ thuộc

```shell
pip install -r requirements.txt
```

#### Cài đặt trình điều khiển trình duyệt Playwright

```shell
playwright install
```

#### Chạy chương trình crawler (Môi trường gốc)

```shell
# Dự án mặc định không bật chế độ thu thập bình luận. Nếu bạn cần lấy bình luận, vui lòng sửa biến ENABLE_GET_COMMENTS trong config/base_config.py
# Các tùy chọn được hỗ trợ khác cũng có thể xem trong config/base_config.py kèm chú thích tiếng Trung

# Đọc từ khóa từ tệp cấu hình để tìm kiếm các bài viết liên quan và thu thập thông tin bài viết cùng bình luận
python main.py --platform xhs --lt qrcode --type search

# Đọc danh sách ID bài viết được chỉ định từ tệp cấu hình để lấy thông tin và bình luận của các bài viết chỉ định
python main.py --platform xhs --lt qrcode --type detail

# Mở ứng dụng tương ứng để quét mã QR đăng nhập

# Để xem ví dụ sử dụng crawler cho các nền tảng khác, thực thi lệnh sau để xem hướng dẫn
python main.py --help
```

</details>


## 💾 Lưu trữ Dữ liệu

MediaCrawler hỗ trợ nhiều phương thức lưu trữ dữ liệu, bao gồm các định dạng CSV, JSON, JSONL, Excel, cơ sở dữ liệu SQLite và MySQL.

📖 **Để biết hướng dẫn sử dụng chi tiết, vui lòng xem: [Hướng dẫn Lưu trữ Dữ liệu](docs/data_storage_guide.md)**

---

[🚀 MediaCrawlerPro Bản phát hành lớn 🚀! Nhiều tính năng hơn, thiết kế kiến trúc tốt hơn!](https://github.com/MediaCrawlerPro)

### 💬 Nhóm Thảo luận
- **Nhóm Thảo luận WeChat**: [Nhấp để tham gia](https://nanmicoder.github.io/MediaCrawler/%E5%BE%AE%E4%BF%A1%E4%BA%A4%E6%B5%81%E7%BE%A4.html)
- **Tài khoản Bilibili**: [Theo dõi tôi](https://space.bilibili.com/434377496), chia sẻ kiến thức về AI và công nghệ crawler


### 💰 Danh sách Nhà tài trợ

<table>
  <thead>
    <tr>
      <th width="220">Nhà tài trợ</th>
      <th align="left">Giới thiệu</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center" valign="middle">
        <a href="https://tikhub.io/?utm_source=github.com/NanmiCoder/MediaCrawler&utm_medium=marketing_social&utm_campaign=retargeting&utm_content=carousel_ad"><img src="docs/static/images/tikhub_banner_zh.png" width="180" alt="TikHub"></a>
      </td>
      <td valign="middle">
        <a href="https://tikhub.io/?utm_source=github.com/NanmiCoder/MediaCrawler&utm_medium=marketing_social&utm_campaign=retargeting&utm_content=carousel_ad">TikHub.io</a> cung cấp hơn 900 giao diện dữ liệu có tính ổn định cao, bao phủ hơn 14 nền tảng phổ biến trong và ngoài nước bao gồm TK, DY, XHS, Y2B, Ins, X, v.v. Hỗ trợ các API dữ liệu công khai đa chiều cho người dùng, nội dung, sản phẩm, bình luận, v.v., với hơn 40 triệu bộ dữ liệu có cấu trúc đã được làm sạch. Sử dụng mã mời <code>cfzyejV9</code> để <a href="https://tikhub.io/?utm_source=github.com/NanmiCoder/MediaCrawler&utm_medium=marketing_social&utm_campaign=retargeting&utm_content=carousel_ad">đăng ký và nạp tiền</a>, nhận thêm $2 tiền thưởng.
      </td>
    </tr>
    <tr>
      <td align="center" valign="middle">
        <a href="https://www.atlascloud.ai/?utm_source=github&utm_medium=link&utm_campaign=mei%27da%27c%27rmeidacrawler"><img width="160" alt="Atlas Cloud" src="docs/static/images/atlas_cloud_logo_black.png#gh-light-mode-only"><img width="160" alt="Atlas Cloud" src="docs/static/images/atlas_cloud_logo_white.png#gh-dark-mode-only"></a>
      </td>
      <td valign="middle">
        <a href="https://www.atlascloud.ai/?utm_source=github&utm_medium=link&utm_campaign=mei%27da%27c%27rmeidacrawler">Atlas Cloud</a> là một nền tảng suy luận AI toàn diện cung cấp cho các nhà phát triển một API AI duy nhất để truy cập tạo video, tạo hình ảnh và các API LLM. Thay vì quản lý tích hợp nhiều nhà cung cấp, bạn chỉ cần kết nối một lần và có quyền truy cập thống nhất vào hơn 300 mô hình được chọn lọc trên tất cả các phương thức. Xem chương trình <a href="https://www.atlascloud.ai/console/coding-plan">khuyến mãi gói coding</a> mới của Atlas Cloud để truy cập API tiết kiệm hơn.
      </td>
    </tr>
    <tr>
      <td align="center" valign="middle">
        <a href="https://go.nodemaven.com/MediaCrawlergh"><img src="docs/static/images/nodemaven_banner.png" width="180" alt="NodeMaven"></a>
      </td>
      <td valign="middle">
        <a href="https://go.nodemaven.com/MediaCrawlergh">NodeMaven</a> là nhà cung cấp proxy hiệu quả cho việc thu thập dữ liệu web và tự động hóa, cung cấp các IP chất lượng cao nhất trên thị trường. Các lợi ích chính bao gồm thời gian hoạt động 99.9%, nhắm mục tiêu theo mã ZIP, lọc IP trên tất cả các proxy (điểm gian lận dưới 97%), không cần KYC và các công cụ miễn phí độc đáo như Kiểm tra băng thông proxy, Kiểm tra thẻ Meta, Tra cứu IP, v.v. Người dùng MediaCrawler được giảm 35% cho proxy di động và dân cư với mã <code>CRAWLER35</code>, và giảm 40% cho proxy ISP (tĩnh) với mã <code>CRAWLER40</code>. 👉 <a href="https://go.nodemaven.com/MediaCrawlergh">Truy cập NodeMaven</a>
      </td>
    </tr>
  </tbody>
</table>

---

### 🤝 Trở thành Nhà tài trợ

Trở thành nhà tài trợ và giới thiệu sản phẩm của bạn tại đây để nhận được lượng tiếp cận lớn mỗi ngày!

**Thông tin Liên hệ**:
- WeChat: `relakkes`
- Email: `relakkes@gmail.com`
---

### 📚 Khác
- **Câu hỏi Thường gặp (FAQ)**: [Tài liệu Hoàn chỉnh về MediaCrawler](https://nanmicoder.github.io/MediaCrawler/)
- **Hướng dẫn cho Người mới bắt đầu Crawl**: [Hướng dẫn Miễn phí CrawlerTutorial](https://github.com/NanmiCoder/CrawlerTutorial)
- **Dự án Mã nguồn mở Thu thập Tin tức**: [NewsCrawlerCollection](https://github.com/NanmiCoder/NewsCrawlerCollection)


## ⭐ Biểu đồ Xu hướng Star

Nếu dự án này giúp ích cho bạn, hãy cho 1 ⭐ Star để ủng hộ và giúp nhiều người biết đến MediaCrawler hơn nhé!

[![Star History Chart](https://www.repostars.dev/api/embed?repo=NanmiCoder%2FMediaCrawler&theme=ocean)](https://www.repostars.dev/?repos=NanmiCoder%2FMediaCrawler&theme=ocean)


## 📚 Tài liệu Tham khảo

- **Kho lưu trữ chữ ký Xiaohongshu**: [Kho chữ ký xhs của Cloxl](https://github.com/Cloxl/xhshow)
- **Client Xiaohongshu**: [Kho xhs của ReaJason](https://github.com/ReaJason/xhs)
- **Chuyển tiếp SMS**: [Kho tham khảo SmsForwarder](https://github.com/pppscn/SmsForwarder)
- **Công cụ Intranet Penetration**: [Tài liệu chính thức của ngrok](https://ngrok.com/docs/)


# <a id="tuyen-bo-mien-tru-trach-nhiem"></a>Tuyên bố Miễn trừ Trách nhiệm
<div id="disclaimer">

## 1. Mục đích và Bản chất Dự án
Dự án này (sau đây gọi là "dự án này") được tạo ra như một công cụ nghiên cứu kỹ thuật và học tập, nhằm mục đích khám phá và tìm hiểu các công nghệ thu thập dữ liệu mạng. Dự án này tập trung vào nghiên cứu các công nghệ thu thập dữ liệu cho các nền tảng mạng xã hội, nhằm cung cấp cho người học và nhà nghiên cứu mục đích trao đổi kỹ thuật.

## 2. Tuyên bố Tuân thủ Pháp luật
Nhà phát triển dự án (sau đây gọi là "nhà phát triển") trịnh trọng nhắc nhở người dùng phải tuân thủ nghiêm ngặt các luật và quy định liên quan của Cộng hòa Nhân dân Trung Hoa cũng như luật pháp nước sở tại khi tải xuống, cài đặt và sử dụng dự án này, bao gồm nhưng không giới hạn ở "Luật An ninh mạng của Cộng hòa Nhân dân Trung Hoa", "Luật Chống gián điệp của Cộng hòa Nhân dân Trung Hoa" và tất cả các luật và chính sách quốc gia hiện hành. Người dùng sẽ chịu mọi trách nhiệm pháp lý có thể phát sinh từ việc sử dụng dự án này.

## 3. Hạn chế Mục đích Sử dụng
Nghiêm cấm sử dụng dự án này cho bất kỳ mục đích bất hợp pháp nào hoặc các hoạt động thương mại phi học tập, phi nghiên cứu. Dự án này không được sử dụng cho bất kỳ hình thức xâm nhập bất hợp pháp nào vào hệ thống máy tính của người khác, cũng như không được sử dụng cho bất kỳ hoạt động nào xâm phạm quyền sở hữu trí tuệ hoặc các quyền và lợi ích hợp pháp khác của người khác. Người dùng cần đảm bảo rằng việc sử dụng dự án này hoàn toàn phục vụ cho việc học tập cá nhân và nghiên cứu kỹ thuật, không được sử dụng cho bất kỳ hình thức hoạt động bất hợp pháp nào.

## 4. Miễn trừ Trách nhiệm
Nhà phát triển đã nỗ lực hết sức để đảm bảo tính hợp pháp và an toàn của dự án này, nhưng không chịu trách nhiệm về bất kỳ hình thức tổn thất trực tiếp hoặc gián tiếp nào có thể phát sinh từ việc người dùng sử dụng dự án này. Bao gồm nhưng không giới hạn ở bất kỳ tổn thất dữ liệu, thiệt hại thiết bị, kiện tụng pháp lý, v.v. do việc sử dụng dự án này gây ra.

## 5. Tuyên bố Quyền Sở hữu Trí tuệ
Quyền sở hữu trí tuệ của dự án này thuộc về nhà phát triển. Dự án này được bảo vệ bởi luật bản quyền và các điều ước quốc tế về bản quyền cũng như các luật và hiệp ước sở hữu trí tuệ khác. Người dùng có thể tải xuống và sử dụng dự án này với tiền đề tuân thủ tuyên bố này cùng các luật và quy định liên quan.

## 6. Quyền Giải thích Cuối cùng
Nhà phát triển có quyền giải thích cuối cùng về dự án này. Nhà phát triển có quyền thay đổi hoặc cập nhật tuyên bố miễn trừ trách nhiệm này bất kỳ lúc nào mà không cần thông báo trước.
</div>


## 🙏 Lời cảm ơn

### Hỗ trợ Bản quyền Mã nguồn mở từ JetBrains

Cảm ơn JetBrains đã hỗ trợ giấy phép mã nguồn mở miễn phí cho dự án này!

<a href="https://www.jetbrains.com/?from=MediaCrawler">
    <img src="https://www.jetbrains.com/company/brand/img/jetbrains_logo.png" width="100" alt="JetBrains" />
</a>
