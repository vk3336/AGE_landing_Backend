const AboutUs = require('../model/AboutUs');

// Get About Us content
exports.getAboutUs = async (req, res) => {
    try {
        const aboutUs = await AboutUs.findOne({}).sort({ createdAt: -1 }).limit(1);
        
        if (!aboutUs) {
            return res.status(200).json({
                status: 'success',
                data: {
                    aboutUs: {
                        description1: '',
                        description2: '',
                        description3: ''
                    }
                }
            });
        }

        res.status(200).json({
            status: 'success',
            data: { aboutUs }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Create new About Us content
exports.createAboutUs = async (req, res) => {
    try {
        const { description1, description2, description3 } = req.body;
        
        const aboutUs = await AboutUs.create({
            description1,
            description2,
            description3
        });

        res.status(201).json({
            status: 'success',
            data: { aboutUs }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update About Us content
exports.updateAboutUs = async (req, res) => {
    try {
        const { id } = req.params;
        const { description1, description2, description3 } = req.body;
        
        const aboutUs = await AboutUs.findByIdAndUpdate(
            id,
            { description1, description2, description3 },
            { new: true, runValidators: true }
        );

        if (!aboutUs) {
            return res.status(404).json({
                status: 'error',
                message: 'No about us content found with that ID'
            });
        }

        res.status(200).json({
            status: 'success',
            data: { aboutUs }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Delete About Us content
exports.deleteAboutUs = async (req, res) => {
    try {
        const { id } = req.params;
        
        const aboutUs = await AboutUs.findByIdAndDelete(id);

        if (!aboutUs) {
            return res.status(404).json({
                status: 'error',
                message: 'No about us content found with that ID'
            });
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};
