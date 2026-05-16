import prisma from "../../prisma/client.js";

export async function getAnnouncements(req, res) {
  const queryParams = req.query;
  const activePage = Math.max(1, parseInt(queryParams.page) || 1);
  const limit = 10;
  const offset = (activePage - 1) * limit;

  const filterConditions = {};
  const searchQuery = queryParams.search?.trim();

  if (searchQuery) {
    filterConditions.title = {
      contains: searchQuery,
    };
  }

  const sortingOrder = queryParams.sort === "oldest" ? "asc" : "desc";

  const [records, totalRows] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: filterConditions,
      orderBy: { createdAt: sortingOrder },
      skip: offset,
      take: limit,
    }),
    prisma.announcement.count({ where: filterConditions }),
  ]);

  return res.json({
    data: records,
    pagination: {
      total: totalRows,
      page: activePage,
      totalPages: Math.ceil(totalRows / limit),
      perPage: limit,
    },
  });
}

export async function getAnnouncementById(req, res) {
  const targetId = parseInt(req.params.id, 10);

  const singleItem = await prisma.announcement.findUniqueOrThrow({
    where: { id: targetId },
  });

  return res.json(singleItem);
}

export async function createAnnouncement(req, res) {
  const payload = req.body;

  const newRecord = await prisma.announcement.create({
    data: payload,
  });

  return res.status(201).json(newRecord);
}

export async function updateAnnouncement(req, res) {
  const targetId = parseInt(req.params.id, 10);
  const freshData = req.body;

  const updatedRecord = await prisma.announcement.update({
    where: { id: targetId },
    data: freshData,
  });

  return res.json(updatedRecord);
}

export async function deleteAnnouncement(req, res) {
  const targetId = parseInt(req.params.id, 10);

  await prisma.announcement.delete({
    where: { id: targetId },
  });

  return res.sendStatus(204);
}
