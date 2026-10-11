<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Ticket;
use App\Models\TicketCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Core Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@ticketflow.io'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('password'),
                'phone' => '+628111000001',
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        $organizer = User::firstOrCreate(
            ['email' => 'organizer@ticketflow.io'],
            [
                'name' => 'Event Horizon Productions',
                'password' => Hash::make('password'),
                'phone' => '+628111000002',
                'role' => 'organizer',
                'status' => 'active',
            ]
        );

        $customer = User::firstOrCreate(
            ['email' => 'customer@ticketflow.io'],
            [
                'name' => 'Budi Santoso',
                'password' => Hash::make('password'),
                'phone' => '+628111000003',
                'role' => 'customer',
                'status' => 'active',
            ]
        );

        // 2. Realistic Events
        $eventsData = [
            [
                'title' => 'Jakarta Tech Summit 2026',
                'slug' => 'jakarta-tech-summit-2026',
                'description' => 'The largest premier engineering, AI, and cloud technology conference in Southeast Asia. 3 days of intensive keynotes, hands-on architectural workshops, and networking.',
                'category' => 'Technology',
                'banner_url' => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
                'venue_name' => 'Jakarta International Expo (JIExpo) Hall A',
                'venue_address' => 'Gedung Pusat Niaga Arena JIEXPO Kemayoran, Jakarta Pusat 10620',
                'status' => 'published',
                'start_time' => now()->addDays(20)->setTime(9, 0),
                'end_time' => now()->addDays(22)->setTime(18, 0),
                'categories' => [
                    [
                        'name' => 'Early Bird Access',
                        'description' => 'Full 3-day access, lunch included, digital conference kit.',
                        'price' => 750000.00,
                        'total_quota' => 200,
                        'available_quota' => 180,
                    ],
                    [
                        'name' => 'Regular Pass',
                        'description' => 'Full 3-day access to all main stages and expo grounds.',
                        'price' => 1250000.00,
                        'total_quota' => 500,
                        'available_quota' => 495,
                    ],
                    [
                        'name' => 'VIP Executive Pass',
                        'description' => 'Access to VIP lounge, private speaker dinner, front-row reserved seating.',
                        'price' => 3500000.00,
                        'total_quota' => 50,
                        'available_quota' => 48,
                    ],
                ],
            ],
            [
                'title' => 'Soundwave Music Festival 2026',
                'slug' => 'soundwave-music-festival-2026',
                'description' => 'An explosive open-air weekend featuring world-class electronic, indie pop, and rock headliners with state-of-the-art audiovisual stages.',
                'category' => 'Music',
                'banner_url' => 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80',
                'venue_name' => 'Gelora Bung Karno Madya Stadium',
                'venue_address' => 'Jl. Pintu Satu Senayan, Gelora, Kecamatan Tanah Abang, Jakarta Pusat',
                'status' => 'published',
                'start_time' => now()->addDays(35)->setTime(15, 0),
                'end_time' => now()->addDays(36)->setTime(23, 59),
                'categories' => [
                    [
                        'name' => 'General Admission - Festival Area',
                        'description' => 'Standard festival grounds entry with festival food truck access.',
                        'price' => 450000.00,
                        'total_quota' => 2000,
                        'available_quota' => 1950,
                    ],
                    [
                        'name' => 'VIP Stage Front Pit',
                        'description' => 'Direct pit access right in front of the main performance stage.',
                        'price' => 1100000.00,
                        'total_quota' => 300,
                        'available_quota' => 290,
                    ],
                ],
            ],
            [
                'title' => 'Clean Code & Microservices Masterclass',
                'slug' => 'clean-code-microservices-masterclass',
                'description' => 'A hands-on coding workshop mastering domain-driven design, event streaming, and clean distributed architectures.',
                'category' => 'Workshop',
                'banner_url' => 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80',
                'venue_name' => 'GoWork Coworking Space Millennium Centennial Center',
                'venue_address' => 'Level 38, Jl. Jend. Sudirman Kav. 25, Karet Setiabudi, Jakarta Selatan',
                'status' => 'published',
                'start_time' => now()->addDays(14)->setTime(10, 0),
                'end_time' => now()->addDays(14)->setTime(17, 0),
                'categories' => [
                    [
                        'name' => 'Workshop Seat (Limited)',
                        'description' => 'Includes mentor code reviews, hands-on repository access, and certification.',
                        'price' => 850000.00,
                        'total_quota' => 30,
                        'available_quota' => 25,
                    ],
                ],
            ],
        ];

        $createdCategories = [];

        foreach ($eventsData as $eventInfo) {
            $categories = $eventInfo['categories'];
            unset($eventInfo['categories']);

            $event = Event::firstOrCreate(
                ['slug' => $eventInfo['slug']],
                array_merge($eventInfo, ['organizer_id' => $organizer->id])
            );

            foreach ($categories as $cat) {
                $category = TicketCategory::firstOrCreate(
                    [
                        'event_id' => $event->id,
                        'name' => $cat['name'],
                    ],
                    [
                        'description' => $cat['description'],
                        'price' => $cat['price'],
                        'total_quota' => $cat['total_quota'],
                        'available_quota' => $cat['available_quota'],
                        'version' => 0,
                        'sale_start_time' => now()->subDays(5),
                        'sale_end_time' => $event->start_time,
                    ]
                );
                $createdCategories[] = $category;
            }
        }

        // 3. Create Sample Paid Order, OrderItem, Payment, and Valid Tickets for Customer
        $firstCategory = $createdCategories[0];
        $orderRef = 'ORD-' . strtoupper(now()->format('Ymd')) . '-SAMPLE1';

        $order = Order::firstOrCreate(
            ['order_reference' => $orderRef],
            [
                'user_id' => $customer->id,
                'status' => 'paid',
                'total_amount' => $firstCategory->price * 2,
                'expires_at' => now()->addHours(1),
            ]
        );

        $orderItem = OrderItem::firstOrCreate(
            [
                'order_id' => $order->id,
                'ticket_category_id' => $firstCategory->id,
            ],
            [
                'quantity' => 2,
                'unit_price' => $firstCategory->price,
                'subtotal' => $firstCategory->price * 2,
            ]
        );

        $payment = Payment::firstOrCreate(
            ['transaction_reference' => 'TX-' . strtoupper(now()->format('YmdHis')) . '-SAMPLE1'],
            [
                'order_id' => $order->id,
                'payment_method' => 'qris',
                'payment_status' => 'success',
                'amount_paid' => $order->total_amount,
                'paid_at' => now(),
                'payload' => [
                    'gateway' => 'mock_gateway',
                    'issuer' => 'QRIS-BCA',
                    'approval_code' => 'APP-849201',
                ],
            ]
        );

        // Generate 2 sample tickets with QR
        for ($i = 1; $i <= 2; $i++) {
            $ticketCode = 'TKT-DEMO-' . str_pad((string)$i, 4, '0', STR_PAD_LEFT);
            $qrData = json_encode([
                'ticket_code' => $ticketCode,
                'order_reference' => $order->order_reference,
                'category_id' => $firstCategory->id,
                'user_id' => $customer->id,
                'event' => 'Jakarta Tech Summit 2026',
            ]);

            $qrSvg = base64_encode(QrCode::format('svg')->size(200)->generate($qrData));

            Ticket::firstOrCreate(
                ['ticket_code' => $ticketCode],
                [
                    'order_id' => $order->id,
                    'order_item_id' => $orderItem->id,
                    'ticket_category_id' => $firstCategory->id,
                    'user_id' => $customer->id,
                    'qr_payload' => $qrSvg,
                    'status' => 'valid',
                ]
            );
        }
    }
}
