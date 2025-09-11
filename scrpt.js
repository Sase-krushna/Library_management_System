// Global variables
        let currentCarouselPosition = 0;
        let books = [];
        let members = [];
        let borrowRecords = [];

        // In-memory data
        let nextBookId = 1;
        let nextMemberId = 1;
        let nextRecordId = 1;
        let inMemoryBooks = [];
        let inMemoryMembers = [];
        let inMemoryRecords = [];

        // Initial Data
        function populateInitialData() {
            const now = new Date();
            const borrowDate = now.toISOString().split('T')[0];
            const returnDate = new Date(now.setDate(now.getDate() + 14)).toISOString().split('T')[0];
            const overdueBorrowDate = new Date(new Date().setDate(new Date().getDate() - 20)).toISOString().split('T')[0];
            const overdueReturnDate = new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split('T')[0];

            inMemoryBooks.push(
                { id: nextBookId++, title: "The Lord of the Rings", author: "J.R.R. Tolkien", genre: "Fiction", available: 1 },
                { id: nextBookId++, title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", genre: "Non-Fiction", available: 1 },
                { id: nextBookId++, title: "The Hitchhiker's Guide to the Galaxy", author: "Douglas Adams", genre: "Science", available: 0 },
                { id: nextBookId++, title: "Cosmos", author: "Carl Sagan", genre: "Science", available: 1 },
                { id: nextBookId++, title: "A Brief History of Time", author: "Stephen Hawking", genre: "Science", available: 0 },
                { id: nextBookId++, title: "The Da Vinci Code", author: "Dan Brown", genre: "Mystery", available: 1 },
                { id: nextBookId++, title: "Pride and Prejudice", author: "Jane Austen", genre: "Romance", available: 1 },
                { id: nextBookId++, title: "1984", author: "George Orwell", genre: "Fiction", available: 1 }
            );

        }

        // Initialize application
        document.addEventListener('DOMContentLoaded', function() {
            populateInitialData();
            initializeNavigation();
            initializeDateFields();
            loadAllData();
        });

        // Event listener for form submissions
        document.getElementById('bookForm')?.addEventListener('submit', addBook);
        document.getElementById('memberForm')?.addEventListener('submit', addMember);
        document.getElementById('borrowForm')?.addEventListener('submit', borrowBook);

        // Helper function for fetching elements
        const getEl = id => document.getElementById(id);

        // UI helper for showing/hiding elements
        const toggleVisibility = (id, show) => {
            const el = getEl(id);
            if (el) el.style.display = show ? 'block' : 'none';
        };

        // Navigation functionality
        function initializeNavigation() {
            const hamburger = document.querySelector('.hamburger');
            const navMenu = document.querySelector('.nav-menu');
            
            hamburger?.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    showSection(this.getAttribute('data-section'));
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                    hamburger?.classList.remove('active');
                    navMenu?.classList.remove('active');
                });
            });
        }

        function initializeDateFields() {
            const today = new Date().toISOString().split('T')[0];
            const returnDate = new Date();
            returnDate.setDate(returnDate.getDate() + 14);
            
            const borrowDateField = getEl('borrowDate');
            const returnDateField = getEl('returnDate');
            
            if (borrowDateField) borrowDateField.value = today;
            if (returnDateField) returnDateField.value = returnDate.toISOString().split('T')[0];
        }

        function showSection(sectionName) {
            document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
            getEl(sectionName)?.classList.add('active');
            
            switch (sectionName) {
                case 'books': loadBooks(); break;
                case 'members': loadMembers(); break;
                case 'borrow': loadBorrowRecords(); populateDropdowns(); break;
                case 'analytics': loadAnalytics(); break;
                case 'dashboard': loadAllData(); break;
            }
        }

        function loadAllData() {
            loadBooks();
            loadMembers();
            loadBorrowRecords();
            updateDashboardStats();
            loadFeaturedBooks();
            populateDropdowns();
        }

        // Books functionality
        function loadBooks() {
            books = inMemoryBooks;
            displayBooks(books);
        }

        function displayBooks(booksToDisplay) {
            const booksGrid = getEl('booksGrid');
            if (!booksGrid) return;
            
            booksGrid.innerHTML = booksToDisplay.length === 0 
                ? '<p style="text-align: center; color: var(--secondary-color); grid-column: 1 / -1;">No books found.</p>'
                : booksToDisplay.map(book => `
                    <div class="book-card">
                        <h3>${escapeHtml(book.title)}</h3>
                        <p class="author">by ${escapeHtml(book.author)}</p>
                        <span class="category">${escapeHtml(book.genre)}</span>
                        <span class="status ${book.available === 1 ? 'available' : 'issued'}">
                            ${book.available === 1 ? 'Available' : 'Issued'}
                        </span>
                        <div class="book-actions">
                            <button class="btn-secondary" onclick="editBook(${book.id})">Edit</button>
                            <button class="btn-danger" onclick="deleteBook(${book.id})">Delete</button>
                        </div>
                    </div>
                `).join('');
        }

        function addBook(event) {
            event.preventDefault();
            const form = getEl('bookForm');
            const newBook = {
                id: nextBookId++,
                title: form.bookTitle.value,
                author: form.bookAuthor.value,
                genre: form.bookGenre.value,
                available: 1
            };
            
            inMemoryBooks.push(newBook);
            showNotification('Book added successfully!', 'success');
            toggleVisibility('addBookForm', false);
            form.reset();
            loadAllData();
        }

        function deleteBook(id) {
            const bookToDelete = inMemoryBooks.find(book => book.id === id);
            if (!bookToDelete || bookToDelete.available === 0) {
                showNotification(bookToDelete ? 'Cannot delete an issued book. Please return it first.' : 'Book not found!', 'error');
                return;
            }
            if (confirm('Are you sure you want to delete this book?')) {
                inMemoryBooks = inMemoryBooks.filter(book => book.id !== id);
                showNotification('Book deleted successfully!', 'success');
                loadAllData();
            }
        }

        function filterBooks() {
            const searchTerm = getEl('bookSearch').value.toLowerCase();
            const genreFilter = getEl('genreFilter').value;
            const statusFilter = getEl('statusFilter').value;
            
            const filteredBooks = books.filter(book => 
                (book.title.toLowerCase().includes(searchTerm) || book.author.toLowerCase().includes(searchTerm)) &&
                (!genreFilter || book.genre === genreFilter) &&
                (statusFilter === '' || book.available == statusFilter)
            );
            displayBooks(filteredBooks);
        }

        // Members functionality
        function loadMembers() {
            members = inMemoryMembers;
            displayMembers(members);
        }

        function displayMembers(membersToDisplay) {
            const membersTable = getEl('membersTable');
            if (!membersTable) return;
            
            membersTable.innerHTML = membersToDisplay.length === 0
                ? '<tr><td colspan="6" style="text-align: center; color: var(--secondary-color);">No members found.</td></tr>'
                : membersToDisplay.map(member => `
                    <tr>
                        <td>${member.id}</td>
                        <td>${escapeHtml(member.name)}</td>
                        <td>${escapeHtml(member.email)}</td>
                        <td>${escapeHtml(member.phone)}</td>
                        <td>${member.created_at || 'N/A'}</td>
                        <td>
                            <button class="btn-secondary" style="margin-right: 0.5rem;" onclick="issueBookToMember(${member.id})">Issue Book</button>
                            <button class="btn-secondary" style="margin-right: 0.5rem;" onclick="editMember(${member.id})">Edit</button>
                            <button class="btn-danger" onclick="deleteMember(${member.id})">Delete</button>
                        </td>
                    </tr>
                `).join('');
        }

        function addMember(event) {
            event.preventDefault();
            const form = getEl('memberForm');
            const newMember = {
                id: nextMemberId++,
                name: form.memberName.value,
                email: form.memberEmail.value,
                phone: form.memberPhone.value,
                created_at: new Date().toLocaleDateString()
            };
            inMemoryMembers.push(newMember);
            showNotification('Member added successfully!', 'success');
            toggleVisibility('addMemberForm', false);
            form.reset();
            loadAllData();
        }

        function deleteMember(id) {
            const memberHasIssuedBooks = inMemoryRecords.some(record => record.member_id === id && !record.actual_return_date);
            if (memberHasIssuedBooks) {
                showNotification('Cannot delete a member with issued books.', 'error');
                return;
            }
            if (confirm('Are you sure you want to delete this member?')) {
                inMemoryMembers = inMemoryMembers.filter(member => member.id !== id);
                showNotification('Member deleted successfully!', 'success');
                loadAllData();
            }
        }

        // Borrow Records functionality
        function loadBorrowRecords() {
            borrowRecords = inMemoryRecords;
            displayBorrowRecords(borrowRecords);
        }

        function displayBorrowRecords(recordsToDisplay) {
            const borrowRecordsTable = getEl('borrowRecordsTable');
            if (!borrowRecordsTable) return;
            
            borrowRecordsTable.innerHTML = recordsToDisplay.length === 0
                ? '<tr><td colspan="7" style="text-align: center; color: var(--secondary-color);">No borrow records found.</td></tr>'
                : recordsToDisplay.map(record => {
                    const isOverdue = new Date(record.return_date) < new Date() && !record.actual_return_date;
                    const recordStatus = isOverdue ? 'Overdue' : (record.actual_return_date ? 'Returned' : 'Issued');
                    const statusClass = isOverdue ? 'issued' : (record.actual_return_date ? 'available' : 'issued');
                    return `
                        <tr>
                            <td>${record.id}</td>
                            <td>${escapeHtml(record.title)}</td>
                            <td>${escapeHtml(record.name)}</td>
                            <td>${record.borrow_date}</td>
                            <td>${record.return_date}</td>
                            <td>
                                <span class="status ${statusClass}">${recordStatus}</span>
                            </td>
                            <td>
                                ${!record.actual_return_date ? `<button class="btn-primary" onclick="returnBook(${record.id})">Return</button>` : '<span style="color: var(--secondary-color);">Returned</span>'}
                            </td>
                        </tr>
                    `;
                }).join('');
        }

        function borrowBook(event) {
            event.preventDefault();
            const form = getEl('borrowForm');
            const bookId = parseInt(form.selectBook.value);
            const memberId = parseInt(form.selectMember.value);
            
            const book = inMemoryBooks.find(b => b.id === bookId);
            const member = inMemoryMembers.find(m => m.id === memberId);
            
            if (!book || !member || book.available === 0) {
                showNotification(book?.available === 0 ? 'This book is already issued!' : 'Book or member not found!', 'error');
                return;
            }

            inMemoryRecords.push({
                id: nextRecordId++,
                book_id: bookId,
                member_id: memberId,
                title: book.title,
                name: member.name,
                borrow_date: form.borrowDate.value,
                return_date: form.returnDate.value,
                actual_return_date: null
            });

            book.available = 0;
            showNotification('Book issued successfully!', 'success');
            toggleVisibility('borrowBookForm', false);
            form.reset();
            loadAllData();
        }

        function returnBook(recordId) {
            const record = inMemoryRecords.find(r => r.id === recordId);
            if (!record || record.actual_return_date) {
                showNotification(record ? 'Book has already been returned.' : 'Record not found!', 'info');
                return;
            }
            const book = inMemoryBooks.find(b => b.id === record.book_id);
            if (book) book.available = 1;
            record.actual_return_date = new Date().toISOString().split('T')[0];
            showNotification('Book returned successfully!', 'success');
            loadAllData();
        }

        // UI Helper Functions
        const showAddBookForm = () => toggleVisibility('addBookForm', true);
        const hideAddBookForm = () => toggleVisibility('addBookForm', false);
        const showAddMemberForm = () => toggleVisibility('addMemberForm', true);
        const hideAddMemberForm = () => toggleVisibility('addMemberForm', false);
        const showBorrowForm = (memberId = null) => {
            toggleVisibility('borrowBookForm', true);
            if (memberId) getEl('selectMember').value = memberId;
        };
        const hideBorrowForm = () => toggleVisibility('borrowBookForm', false);

        function issueBookToMember(memberId) {
            showSection('borrow');
            showBorrowForm(memberId);
        }

        function populateDropdowns() {
            populateBookDropdown();
            populateMemberDropdown();
        }

        function populateBookDropdown() {
            const selectBook = getEl('selectBook');
            if (!selectBook) return;
            selectBook.innerHTML = '<option value="">Choose a book...</option>' + 
                inMemoryBooks.filter(book => book.available === 1)
                .map(book => `<option value="${book.id}">${book.title} - ${book.author}</option>`)
                .join('');
        }

        function populateMemberDropdown() {
            const selectMember = getEl('selectMember');
            if (!selectMember) return;
            selectMember.innerHTML = '<option value="">Choose a member...</option>' +
                inMemoryMembers.map(member => `<option value="${member.id}">${member.name} (${member.email})</option>`)
                .join('');
        }

        // Dashboard and Statistics
        function updateDashboardStats() {
            const issuedCount = inMemoryBooks.filter(book => book.available === 0).length;
            const availableCount = inMemoryBooks.filter(book => book.available === 1).length;
            getEl('totalBooks').textContent = inMemoryBooks.length;
            getEl('totalMembers').textContent = inMemoryMembers.length;
            getEl('booksIssued').textContent = issuedCount;
            getEl('availableBooks').textContent = availableCount;
        }

        function loadFeaturedBooks() {
            const carouselTrack = getEl('carouselTrack');
            if (!carouselTrack) return;
            carouselTrack.innerHTML = inMemoryBooks.slice(0, 6)
                .map(book => `
                    <div class="carousel-item">
                        <h4>${escapeHtml(book.title)}</h4>
                        <p>${escapeHtml(book.author)}</p>
                        <small>${escapeHtml(book.genre)}</small>
                    </div>
                `).join('');
        }

        function loadAnalytics() {
            getEl('totalBorrows').textContent = inMemoryRecords.length;
            
            const overdueCount = inMemoryRecords.filter(record => new Date(record.return_date) < new Date() && !record.actual_return_date).length;
            getEl('overdueBooks').textContent = overdueCount;
            
            const genreCount = inMemoryBooks.reduce((counts, book) => {
                counts[book.genre] = (counts[book.genre] || 0) + 1;
                return counts;
            }, {});
            const mostPopularGenre = Object.keys(genreCount).reduce((a, b) => genreCount[a] > genreCount[b] ? a : b, 'N/A');
            getEl('popularGenre').textContent = mostPopularGenre;
            
            const returnedRecords = inMemoryRecords.filter(r => r.actual_return_date);
            const totalDays = returnedRecords.reduce((sum, record) => sum + Math.ceil(Math.abs(new Date(record.actual_return_date) - new Date(record.borrow_date)) / (1000 * 60 * 60 * 24)), 0);
            const avgDays = returnedRecords.length > 0 ? Math.round(totalDays / returnedRecords.length) : 'N/A';
            getEl('avgBorrowTime').textContent = avgDays;
            
            loadRecentActivities();
        }

        function loadRecentActivities() {
            const activitiesContainer = getEl('recentActivities');
            if (!activitiesContainer) return;
            
            const recentRecords = [...inMemoryRecords].slice(-5).reverse();
            activitiesContainer.innerHTML = recentRecords.length === 0
                ? '<p style="color: var(--secondary-color); text-align: center;">No recent activities</p>'
                : recentRecords.map(record => `
                    <div class="activity-item">
                        <div class="activity-text">"${escapeHtml(record.title)}" issued to ${escapeHtml(record.name)}</div>
                        <div class="activity-time">${getTimeAgo(new Date(record.borrow_date))}</div>
                    </div>
                `).join('');
        }

        // Carousel functionality
        function moveCarousel(direction) {
            const track = getEl('carouselTrack');
            if (!track || !track.children.length) return;
            
            const itemWidth = 220;
            const maxPosition = -(track.children.length - 3) * itemWidth;
            currentCarouselPosition = Math.max(Math.min(currentCarouselPosition + direction * itemWidth, 0), maxPosition);
            
            track.style.transform = `translateX(${currentCarouselPosition}px)`;
        }

        // Auto-scroll carousel
        setInterval(() => {
            const track = getEl('carouselTrack');
            if (track && track.children.length > 3) {
                moveCarousel(-1);
                if (currentCarouselPosition <= -((track.children.length - 3) * 220)) {
                    currentCarouselPosition = 220;
                }
            }
        }, 4000);

        // Utility functions
        function escapeHtml(text) {
            return text ? text.replace(/[&<>"']/g, match => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[match])) : '';
        }

        function getTimeAgo(date) {
            const diffInSeconds = Math.floor((new Date() - date) / 1000);
            if (diffInSeconds < 60) return 'Just now';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
            if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
            return date.toLocaleDateString();
        }

        function showNotification(message, type = 'info') {
            document.querySelectorAll('.notification').forEach(notification => notification.remove());
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 4000);
        }

        // Edit functions (placeholder implementations)
        function editBook(id) {
            showNotification('Edit book functionality is not supported in this in-memory version.', 'info');
        }

        function editMember(id) {
            showNotification('Edit member functionality is not supported in this in-memory version.', 'info');
        }

        // Custom modal for confirm()
        function confirm(message) {
            return window.confirm(message);
        }
