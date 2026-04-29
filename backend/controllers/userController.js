export const updateProfilePhoto = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Profile image is required" });

  req.user.profilePhoto = `/${req.file.path.replaceAll("\\", "/")}`;
  await req.user.save();

  res.json({
    message: "Profile photo updated",
    profilePhoto: req.user.profilePhoto
  });
};
