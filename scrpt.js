
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

            inMemoryMembers.push(
                { id: nextMemberId++, name: "John Doe", email: "john.doe@example.com", phone: "123-456-7890", created_at: new Date().toLocaleDateString() },
                { id: nextMemberId++, name: "Jane Smith", email: "jane.smith@example.com", phone: "098-765-4321", created_at: new Date().toLocaleDateString() }
            );

            // Add some initial borrow records
            inMemoryRecords.push(
                { id: nextRecordId++, book_id: 3, member_id: 1, title: "The Hitchhiker's Guide to the Galaxy", name: "John Doe", borrow_date: new Date().toISOString().split('T')[0], return_date: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0], actual_return_date: null },
                { id: nextRecordId++, book_id: 5, member_id: 2, title: "A Brief History of Time", name: "Jane Smith", borrow_date: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString().split('T')[0], return_date: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split('T')[0], actual_return_date: null }
            );
        }

        // Initialize application
        document.addEventListener('DOMContentLoaded', function() {
            populateInitialData();
            initializeNavigation();
            initializeDateFields();
            loadAllData();
        });

        // Navigation functionality
        function initializeNavigation() {
            const hamburger = document.querySelector('.hamburger');
            const navMenu = document.querySelector('.nav-menu');
            
            hamburger.addEventListener('click', function() {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Navigation links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const section = this.getAttribute('data-section');
                    showSection(section);
                    
                    // Update active nav link
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Close mobile menu
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }

        // Initialize date fields with default values
        function initializeDateFields() {
            const today = new Date().toISOString().split('T')[0];
            const returnDate = new Date();
            returnDate.setDate(returnDate.getDate() + 14);
            
            const borrowDateField = document.getElementById('borrowDate');
            const returnDateField = document.getElementById('returnDate');
            
            if (borrowDateField) borrowDateField.value = today;
            if (returnDateField) returnDateField.value = returnDate.toISOString().split('T')[0];
        }

        // Section navigation
        function showSection(sectionName) {
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            
            document.getElementById(sectionName).classList.add('active');
            
            // Load section-specific data
            if (sectionName === 'books') {
                loadBooks();
            } else if (sectionName === 'members') {
                loadMembers();
            } else if (sectionName === 'borrow') {
                loadBorrowRecords();
                populateDropdowns();
            } else if (sectionName === 'analytics') {
                loadAnalytics();
            } else if (sectionName === 'dashboard') {
                 loadAllData();
            }
        }

        // Load all initial data
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
            const booksGrid = document.getElementById('booksGrid');
            if (!booksGrid) return;
            
            booksGrid.innerHTML = '';
            
            if (booksToDisplay.length === 0) {
                booksGrid.innerHTML = '<p style="text-align: center; color: var(--secondary-color); grid-column: 1 / -1;">No books found.</p>';
                return;
            }
            
            booksToDisplay.forEach(book => {
                const bookCard = document.createElement('div');
                bookCard.className = 'book-card';
                bookCard.innerHTML = `
                    <h3>${escapeHtml(book.title)}</h3>
                    <p class="author">by ${escapeHtml(book.author)}</p>
                    <span class="category">${escapeHtml(book.genre)}</span>
                    <span class="status ${book.available == 1 ? 'available' : 'issued'}">
                        ${book.available == 1 ? 'Available' : 'Issued'}
                    </span>
                    <div class="book-actions">
                        <button class="btn-secondary" onclick="editBook(${book.id})">Edit</button>
                        <button class="btn-danger" onclick="deleteBook(${book.id})">Delete</button>
                    </div>
                `;
                booksGrid.appendChild(bookCard);
            });
        }

        function addBook(event) {
            event.preventDefault();
            
            const form = document.getElementById('bookForm');
            const newBook = {
                id: nextBookId++,
                title: form.bookTitle.value,
                author: form.bookAuthor.value,
                genre: form.bookGenre.value,
                available: 1
            };
            
            inMemoryBooks.push(newBook);
            showNotification('Book added successfully!', 'success');
            hideAddBookForm();
            loadAllData();
        }

        function deleteBook(id) {
            const bookToDelete = inMemoryBooks.find(book => book.id === id);
            
            if (!bookToDelete) {
                showNotification('Book not found!', 'error');
                return;
            }

            if (bookToDelete.available == 0) {
                showNotification('Cannot delete an issued book. Please return it first.', 'error');
                return;
            }

            if (!confirm('Are you sure you want to delete this book?')) {
                return;
            }

            inMemoryBooks = inMemoryBooks.filter(book => book.id !== id);
            showNotification('Book deleted successfully!', 'success');
            loadAllData();
        }

        function filterBooks() {
            const searchTerm = document.getElementById('bookSearch').value.toLowerCase();
            const genreFilter = document.getElementById('genreFilter').value;
            const statusFilter = document.getElementById('statusFilter').value;
            
            const filteredBooks = books.filter(book => {
                const matchesSearch = book.title.toLowerCase().includes(searchTerm) || 
                                    book.author.toLowerCase().includes(searchTerm);
                const matchesGenre = !genreFilter || book.genre === genreFilter;
                const matchesStatus = statusFilter === '' || book.available == statusFilter;
                
                return matchesSearch && matchesGenre && matchesStatus;
            });
            
            displayBooks(filteredBooks);
        }

        // Members functionality
        function loadMembers() {
            members = inMemoryMembers;
            displayMembers(members);
        }

        function displayMembers(membersToDisplay) {
            const membersTable = document.getElementById('membersTable');
            if (!membersTable) return;
            
            membersTable.innerHTML = '';
            
            if (membersToDisplay.length === 0) {
                membersTable.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--secondary-color);">No members found.</td></tr>';
                return;
            }
            
            membersToDisplay.forEach(member => {
                const row = document.createElement('tr');
                row.innerHTML = `
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
                `;
                membersTable.appendChild(row);
            });
        }

        function addMember(event) {
            event.preventDefault();
            
            const form = document.getElementById('memberForm');
            const newMember = {
                id: nextMemberId++,
                name: form.memberName.value,
                email: form.memberEmail.value,
                phone: form.memberPhone.value,
                created_at: new Date().toLocaleDateString()
            };
            
            inMemoryMembers.push(newMember);
            showNotification('Member added successfully!', 'success');
            hideAddMemberForm();
            loadAllData();
        }

        function deleteMember(id) {
            // Check if member has any outstanding books
            const memberHasIssuedBooks = inMemoryRecords.some(record => record.member_id === id && !record.actual_return_date);

            if (memberHasIssuedBooks) {
                showNotification('Cannot delete a member with issued books.', 'error');
                return;
            }

            if (!confirm('Are you sure you want to delete this member?')) {
                return;
            }

            inMemoryMembers = inMemoryMembers.filter(member => member.id !== id);
            showNotification('Member deleted successfully!', 'success');
            loadAllData();
        }

        // Borrow Records functionality
        function loadBorrowRecords() {
            borrowRecords = inMemoryRecords;
            displayBorrowRecords(borrowRecords);
        }

        function displayBorrowRecords(recordsToDisplay) {
            const borrowRecordsTable = document.getElementById('borrowRecordsTable');
            if (!borrowRecordsTable) return;
            
            borrowRecordsTable.innerHTML = '';
            
            if (recordsToDisplay.length === 0) {
                borrowRecordsTable.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--secondary-color);">No borrow records found.</td></tr>';
                return;
            }
            
            recordsToDisplay.forEach(record => {
                const isOverdue = new Date(record.return_date) < new Date() && !record.actual_return_date;
                const recordStatus = isOverdue ? 'Overdue' : (record.actual_return_date ? 'Returned' : 'Issued');
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${record.id}</td>
                    <td>${escapeHtml(record.title)}</td>
                    <td>${escapeHtml(record.name)}</td>
                    <td>${record.borrow_date}</td>
                    <td>${record.return_date}</td>
                    <td>
                        <span class="status ${isOverdue ? 'issued' : (record.actual_return_date ? 'available' : 'issued')}">
                            ${recordStatus}
                        </span>
                    </td>
                    <td>
                        ${!record.actual_return_date ? 
                            `<button class="btn-primary" onclick="returnBook(${record.id})">Return</button>` :
                            '<span style="color: var(--secondary-color);">Returned</span>'
                        }
                    </td>
                `;
                borrowRecordsTable.appendChild(row);
            });
        }

        function borrowBook(event) {
            event.preventDefault();
            
            const form = document.getElementById('borrowForm');
            const bookId = parseInt(form.selectBook.value);
            const memberId = parseInt(form.selectMember.value);
            
            const book = inMemoryBooks.find(b => b.id === bookId);
            const member = inMemoryMembers.find(m => m.id === memberId);
            
            if (!book || !member) {
                showNotification('Book or member not found!', 'error');
                return;
            }

            if (book.available === 0) {
                showNotification('This book is already issued!', 'error');
                return;
            }

            const newRecord = {
                id: nextRecordId++,
                book_id: bookId,
                member_id: memberId,
                title: book.title,
                name: member.name,
                borrow_date: form.borrowDate.value,
                return_date: form.returnDate.value,
                actual_return_date: null
            };

            inMemoryRecords.push(newRecord);
            book.available = 0; // Update book status
            
            showNotification('Book issued successfully!', 'success');
            hideBorrowForm();
            loadAllData();
        }

        function returnBook(recordId) {
            const record = inMemoryRecords.find(r => r.id === recordId);
            
            if (!record) {
                showNotification('Record not found!', 'error');
                return;
            }

            if (record.actual_return_date) {
                showNotification('Book has already been returned.', 'info');
                return;
            }

            const book = inMemoryBooks.find(b => b.id === record.book_id);
            if (book) {
                book.available = 1; // Mark book as available
            }

            record.actual_return_date = new Date().toISOString().split('T')[0];
            showNotification('Book returned successfully!', 'success');
            loadAllData();
        }

        // UI Helper Functions
        function showAddBookForm() {
            document.getElementById('addBookForm').style.display = 'block';
            document.getElementById('addBookForm').scrollIntoView({ behavior: 'smooth' });
        }

        function hideAddBookForm() {
            document.getElementById('addBookForm').style.display = 'none';
            document.getElementById('bookForm').reset();
        }

        function showAddMemberForm() {
            document.getElementById('addMemberForm').style.display = 'block';
            document.getElementById('addMemberForm').scrollIntoView({ behavior: 'smooth' });
        }

        function hideAddMemberForm() {
            document.getElementById('addMemberForm').style.display = 'none';
            document.getElementById('memberForm').reset();
        }

        function showBorrowForm(memberId = null) {
            document.getElementById('borrowBookForm').style.display = 'block';
            document.getElementById('borrowBookForm').scrollIntoView({ behavior: 'smooth' });

            if (memberId) {
                document.getElementById('selectMember').value = memberId;
            }
        }

        function hideBorrowForm() {
            document.getElementById('borrowBookForm').style.display = 'none';
            document.getElementById('borrowForm').reset();
        }

        // New function to issue a book to a specific member
        function issueBookToMember(memberId) {
            // First, navigate to the borrow section
            showSection('borrow');
            // Then, set the member in the form
            showBorrowForm(memberId);
        }

        // Populate dropdown menus
        function populateDropdowns() {
            populateBookDropdown();
            populateMemberDropdown();
        }

        function populateBookDropdown() {
            const selectBook = document.getElementById('selectBook');
            if (!selectBook) return;
            
            selectBook.innerHTML = '<option value="">Choose a book...</option>';
            
            const availableBooks = inMemoryBooks.filter(book => book.available == 1);
            availableBooks.forEach(book => {
                const option = document.createElement('option');
                option.value = book.id;
                option.textContent = `${book.title} - ${book.author}`;
                selectBook.appendChild(option);
            });
        }

        function populateMemberDropdown() {
            const selectMember = document.getElementById('selectMember');
            if (!selectMember) return;
            
            selectMember.innerHTML = '<option value="">Choose a member...</option>';
            
            inMemoryMembers.forEach(member => {
                const option = document.createElement('option');
                option.value = member.id;
                option.textContent = `${member.name} (${member.email})`;
                selectMember.appendChild(option);
            });
        }

        // Dashboard and Statistics
        function updateDashboardStats() {
            const totalBooksEl = document.getElementById('totalBooks');
            const totalMembersEl = document.getElementById('totalMembers');
            const booksIssuedEl = document.getElementById('booksIssued');
            const availableBooksEl = document.getElementById('availableBooks');
            
            if (totalBooksEl) totalBooksEl.textContent = inMemoryBooks.length;
            if (totalMembersEl) totalMembersEl.textContent = inMemoryMembers.length;
            
            const issuedCount = inMemoryBooks.filter(book => book.available == 0).length;
            const availableCount = inMemoryBooks.filter(book => book.available == 1).length;
            
            if (booksIssuedEl) booksIssuedEl.textContent = issuedCount;
            if (availableBooksEl) availableBooksEl.textContent = availableCount;
        }

        function loadFeaturedBooks() {
            const carouselTrack = document.getElementById('carouselTrack');
            if (!carouselTrack) return;
            
            carouselTrack.innerHTML = '';
            
            // Show first 6 books as featured
            const featuredBooks = inMemoryBooks.slice(0, 6);
            
            featuredBooks.forEach(book => {
                const item = document.createElement('div');
                item.className = 'carousel-item';
                item.innerHTML = `
                    <h4>${escapeHtml(book.title)}</h4>
                    <p>${escapeHtml(book.author)}</p>
                    <small>${escapeHtml(book.genre)}</small>
                `;
                carouselTrack.appendChild(item);
            });
        }

        function loadAnalytics() {
            // Update analytics stats
            const totalBorrowsEl = document.getElementById('totalBorrows');
            const overdueBooksEl = document.getElementById('overdueBooks');
            const popularGenreEl = document.getElementById('popularGenre');
            const avgBorrowTimeEl = document.getElementById('avgBorrowTime');
            
            if (totalBorrowsEl) totalBorrowsEl.textContent = inMemoryRecords.length;
            
            // Calculate overdue books
            const overdueCount = inMemoryRecords.filter(record => 
                new Date(record.return_date) < new Date() && !record.actual_return_date
            ).length;
            if (overdueBooksEl) overdueBooksEl.textContent = overdueCount;
            
            // Calculate most popular genre
            const genreCount = {};
            inMemoryBooks.forEach(book => {
                genreCount[book.genre] = (genreCount[book.genre] || 0) + 1;
            });
            
            const mostPopularGenre = Object.keys(genreCount).reduce((a, b) => 
                genreCount[a] > genreCount[b] ? a : b, 'N/A'
            );
            if (popularGenreEl) popularGenreEl.textContent = mostPopularGenre;
            
            // Calculate average borrow time (simplified)
            const returnedRecords = inMemoryRecords.filter(r => r.actual_return_date);
            let totalDays = 0;
            if (returnedRecords.length > 0) {
                returnedRecords.forEach(record => {
                    const borrowDate = new Date(record.borrow_date);
                    const returnDate = new Date(record.actual_return_date);
                    const diffTime = Math.abs(returnDate - borrowDate);
                    totalDays += Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                });
                const avgDays = Math.round(totalDays / returnedRecords.length);
                if (avgBorrowTimeEl) avgBorrowTimeEl.textContent = avgDays;
            } else {
                if (avgBorrowTimeEl) avgBorrowTimeEl.textContent = 'N/A';
            }
            
            // Load recent activities
            loadRecentActivities();
        }

        function loadRecentActivities() {
            const activitiesContainer = document.getElementById('recentActivities');
            if (!activitiesContainer) return;
            
            activitiesContainer.innerHTML = '';
            
            // Get recent borrow records (last 5)
            const recentRecords = [...inMemoryRecords].slice(-5).reverse();
            
            recentRecords.forEach(record => {
                const activity = document.createElement('div');
                activity.className = 'activity-item';
                
                const timeAgo = getTimeAgo(new Date(record.borrow_date));
                
                activity.innerHTML = `
                    <div class="activity-text">
                        "${escapeHtml(record.title)}" issued to ${escapeHtml(record.name)}
                    </div>
                    <div class="activity-time">${timeAgo}</div>
                `;
                activitiesContainer.appendChild(activity);
            });
            
            if (recentRecords.length === 0) {
                activitiesContainer.innerHTML = '<p style="color: var(--secondary-color); text-align: center;">No recent activities</p>';
            }
        }

        // Carousel functionality
        function moveCarousel(direction) {
            const track = document.getElementById('carouselTrack');
            if (!track || !track.children.length) return;
            
            const items = track.children;
            const itemWidth = 220; // 200px + 20px gap
            const visibleItems = 3;
            const maxPosition = -(items.length - visibleItems) * itemWidth;
            
            currentCarouselPosition += direction * itemWidth;
            
            if (currentCarouselPosition > 0) {
                currentCarouselPosition = 0;
            } else if (currentCarouselPosition < maxPosition) {
                currentCarouselPosition = maxPosition;
            }
            
            track.style.transform = `translateX(${currentCarouselPosition}px)`;
        }

        // Auto-scroll carousel
        setInterval(() => {
            const track = document.getElementById('carouselTrack');
            if (track && track.children.length > 3) {
                moveCarousel(-1);
                if (currentCarouselPosition <= -((track.children.length - 3) * 220)) {
                    currentCarouselPosition = 220; // Reset for smooth loop
                }
            }
        }, 4000);

        // Utility functions
        function escapeHtml(text) {
            if (!text) return '';
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, function(m) { return map[m]; });
        }

        function getTimeAgo(date) {
            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);
            
            if (diffInSeconds < 60) return 'Just now';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
            if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
            
            return date.toLocaleDateString();
        }

        function showNotification(message, type = 'info') {
            // Remove existing notifications
            const existingNotifications = document.querySelectorAll('.notification');
            existingNotifications.forEach(notification => notification.remove());
            
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 4000);
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
            const result = window.confirm(message);
            return result;
        }

