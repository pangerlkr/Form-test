# Form Builder Platform 📋

An internal form builder platform similar to Google Forms, designed for NGO/Company use. Create customizable forms, collect responses, and analyze data with statistics and charts.

## Features ✨

### Form Creation
- **Multiple Question Types**: Short answer, paragraph, multiple choice, checkboxes, dropdown, file upload
- **Customization Options**:
  - Custom themes and colors
  - Header images
  - Embedded videos
  - Form descriptions
- **Drag & Drop**: Reorder questions easily
- **Required Fields**: Mark questions as mandatory

### Response Collection
- User-friendly form filling interface
- File upload support
- Real-time validation
- Success confirmation

### Analytics & Reporting
- **Statistics Dashboard**: View total responses and trends
- **Visual Charts**: Bar charts for multiple-choice and checkbox questions
- **Data Export**: Download responses as CSV
- **Individual Response View**: See detailed answers from each submission

## Technology Stack 🛠️

- **Backend**: Node.js + Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Data Storage**: JSON file-based storage
- **Charts**: Chart.js
- **File Upload**: Multer

## Installation 🚀

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Steps

1. Clone the repository:
```bash
git clone https://github.com/pangerlkr/Form-test.git
cd Form-test
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage 📖

### Creating a Form

1. Navigate to the dashboard at `http://localhost:3000`
2. Click "Create New Form"
3. Add a title and description
4. Customize the theme (color, header image, video)
5. Add questions by clicking the question type buttons
6. Configure each question:
   - Set the question text
   - Add options (for MCQ, checkboxes, dropdown)
   - Mark as required if needed
7. Reorder questions using up/down arrows
8. Click "Save Form"

### Filling Out a Form

1. From the dashboard, click "Fill Form" on any form card
2. Answer all questions
3. Upload files if required
4. Click "Submit"
5. View success confirmation

### Viewing Responses

1. From the dashboard, click "Responses" on any form card
2. View statistics:
   - Total response count
   - Charts for multiple-choice questions
   - Individual response details
3. Export responses to CSV for further analysis

## Project Structure 📁

```
Form-test/
├── server/
│   └── server.js           # Express server and API routes
├── public/
│   ├── index.html          # Dashboard page
│   ├── create-form.html    # Form builder page
│   ├── fill-form.html      # Form filling page
│   ├── responses.html      # Response analytics page
│   ├── css/
│   │   └── styles.css      # All styling
│   ├── js/
│   │   ├── dashboard.js    # Dashboard functionality
│   │   ├── form-builder.js # Form creation logic
│   │   ├── form-view.js    # Form filling logic
│   │   └── responses.js    # Analytics and export
│   └── uploads/            # Uploaded files
├── data/
│   ├── forms.json          # Form definitions
│   └── responses.json      # Form responses
├── package.json
└── README.md
```

## API Endpoints 🔌

### Forms
- `GET /api/forms` - Get all forms
- `GET /api/forms/:id` - Get a specific form
- `POST /api/forms` - Create a new form
- `PUT /api/forms/:id` - Update a form
- `DELETE /api/forms/:id` - Delete a form

### Responses
- `POST /api/responses` - Submit a form response
- `GET /api/responses/:formId` - Get all responses for a form
- `GET /api/stats/:formId` - Get statistics for a form

### File Upload
- `POST /api/upload` - Upload a file

## Configuration ⚙️

You can customize the server port by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## Development 💻

To run in development mode:
```bash
npm run dev
```

## Netlify Deployment 🚀

This project is configured for easy deployment on Netlify! See [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**
1. Push this repository to GitHub
2. Log in to [Netlify](https://app.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Select this repository
5. Deploy!

The configuration is ready - Netlify will automatically detect the settings.

## Future Enhancements 🔮

- User authentication and authorization
- Google Drive integration
- Email notifications
- Form templates
- Conditional logic (skip questions based on answers)
- Real-time collaboration
- Form versioning
- Advanced analytics (pie charts, line graphs)
- Response editing
- Form scheduling (open/close dates)

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

ISC

## Support 💬

For questions or issues, please open an issue on GitHub.
