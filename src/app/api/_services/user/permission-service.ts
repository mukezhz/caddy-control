import prisma from "@/lib/prisma";
import { ResourceAction, RESOURCES, generatePermissionName, getPermissionDescription } from "@/config/resources";

/**
 * Seeds default permissions into the database based on the RESOURCES configuration
 */
export async function seedPermissions() {
  console.info("Starting permission seeding...");

  try {
    // Get existing permissions to avoid duplicates
    const existingPermissions = await prisma.permission.findMany();
    const existingPermissionNames = new Set(existingPermissions.map(p => p.name));

    let createdCount = 0;
    let skippedCount = 0;

    // Create an array of all possible permissions from resources
    const allPermissions = RESOURCES.flatMap(resource => {
      return resource.availableActions.map(action => ({
        name: generatePermissionName(resource.id, action),
        description: getPermissionDescription(resource.id, action as ResourceAction)
      })
      )
    })

    // Create permissions that don't already exist
    for (const permission of allPermissions) {
      if (!existingPermissionNames.has(permission.name)) {
        await prisma.permission.create({
          data: {
            name: permission.name,
            description: permission.description
          }
        });
        createdCount++;
      } else {
        skippedCount++;
      }
    }

    console.info(`✅ Permissions seeding completed: ${createdCount} created, ${skippedCount} already existed`);
  } catch (error) {
    console.error("❌ Error seeding permissions:", error);
  }
}