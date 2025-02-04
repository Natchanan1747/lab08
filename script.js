// blog class - จัดการข้อมูลบล็อก
class Blog {
  constructor(id, title, content, tags = []) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.tags = tags;
    this.createdDate = new Date();
    this.updatedDate = new Date();
  }

  update(title, content, tags) {
    this.title = title;
    this.content = content;
    this.tags = tags;
    this.updatedDate = new Date();
  }

  getFormattedDate() {
    return this.updatedDate.toLocaleString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

//BlogManager Class - รับผิดชอบจัดการ array ของบล็อก
class BlogManager {
  constructor() {
    this.blogs = this.loadBlogs();
  }

  addBlog(title, content, tags) {
    const blog = new Blog(Date.now(), title, content, tags);
    this.blogs.push(blog);
    this.sortBlogs();
    this.saveBlogs();
    return blog;
  }

  updateBlog(id, title, content, tags) {
    const blog = this.getBlog(id);
    if (blog) {
      blog.update(title, content, tags);
      this.sortBlogs();
      this.saveBlogs();
    }
    return blog;
  }

  deleteBlog(id) {
    this.blogs = this.blogs.filter((blog) => blog.id !== id);
    this.saveBlogs();
  }

  getBlog(id) {
    return this.blogs.find((blog) => blog.id === id);
  }

  sortBlogs() {
    this.blogs.sort((a, b) => b.updatedDate - a.updatedDate);
  }

  saveBlogs() {
    localStorage.setItem('blogs', JSON.stringify(this.blogs));
  }

  loadBlogs() {
    const blogs = localStorage.getItem('blogs');
    return blogs ? JSON.parse(blogs).map(blog => new Blog(blog.id, blog.title, blog.content, blog.tags)) : [];
  }
}

//UI Class - รับผิดชอบจัดการ DOM และ Events
class BlogUI {
  constructor(blogManager) {
    this.blogManager = blogManager;
    this.initElements();
    this.initEventListeners();
    this.render(); // เรียกใช้ render เมื่อเริ่มต้นใช้งานโปรแกรม
  }

  initElements() {
    this.form = document.getElementById("blog-form");
    this.titleInput = document.getElementById("title");
    this.contentInput = document.getElementById("content");
    this.tagsInput = document.getElementById("tags");
    this.editIdInput = document.getElementById("edit-id");
    this.formTitle = document.getElementById("form-title");
    this.cancelBtn = document.getElementById("cancel-btn");
    this.blogList = document.getElementById("blog-list");
  }

  initEventListeners() {
    // จัดการการ submit form
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // จัดการปุ่มยกเลิก
    this.cancelBtn.addEventListener("click", () => {
      this.resetForm();
    });
  }

  handleSubmit() {
    const title = this.titleInput.value.trim();
    const content = this.contentInput.value.trim();
    const tags = this.tagsInput.value.split(',').map(tag => tag.trim());
    const editId = parseInt(this.editIdInput.value);
    if (title && content) {
      if (editId) {
        this.blogManager.updateBlog(editId, title, content, tags);
      } else {
        this.blogManager.addBlog(title, content, tags);
      }
      this.resetForm();
      this.render();
    }
  }

  editBlog(id) {
    const blog = this.blogManager.getBlog(id);
    if (blog) {
      this.titleInput.value = blog.title;
      this.contentInput.value = blog.content;
      this.tagsInput.value = blog.tags.join(', ');
      this.editIdInput.value = blog.id;
      this.formTitle.textContent = "แก้ไขบล็อก";
      this.cancelBtn.classList.remove("hidden");
      window.scrollTo(0, 0);
    }
  }

  deleteBlog(id) {
    if (confirm("ต้องการลบบล็อกนี้ใช่หรือไม่?")) {
      this.blogManager.deleteBlog(id);
      this.render();
    }
  }

  resetForm() {
    this.form.reset();
    this.editIdInput.value = "";
    this.formTitle.textContent = "เขียนบล็อกใหม่";
    this.cancelBtn.classList.add("hidden");
  }

  render() {
    this.blogList.innerHTML = this.blogManager.blogs
      .map(
        (blog) => `
            <div class="blog-post">
                <h2 class="blog-title">${blog.title}</h2>
                <div class="blog-date">
                    อัพเดทเมื่อ: ${blog.getFormattedDate()}
                </div>
                <div class="blog-content">
                    ${blog.content.replace(/\n/g, "<br>")}
                </div>
                <div class="blog-tags">
                    แท็ก: ${blog.tags.join(', ')}
                </div>
                <div class="blog-actions">
                    <button class="btn-edit" onclick="blogUI.editBlog(${
                        blog.id
                    })">แก้ไข</button>
                    <button class="btn-delete" onclick="blogUI.deleteBlog(${
                        blog.id
                    })">ลบ</button>
                </div>
            </div>
        `
      )
      .join("");
  }
}

// สร้าง instance และเริ่มต้นใช้งาน
const blogManager = new BlogManager();
const blogUI = new BlogUI(blogManager);