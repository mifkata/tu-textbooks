# Речник на съкращенията — Микропроцесорни системи

> Тази страница съдържа всички съкращения, използвани в курса, с кратко обяснение и препратка към главата, в която са въведени.

---

## A

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **ACPI** | Advanced Configuration and Power Interface | Стандарт за управление на захранването и конфигурация | [Гл. 5](05_system_architecture.md) |
| **APIC** | Advanced Programmable Interrupt Controller | Разширен програмируем контролер на прекъсванията; заменя 8259A в многопроцесорни системи | [Гл. 13](13_smp.md), [Гл. 14](14_interrupt_controllers.md) |
| **ADS#** | Address Strobe | Сигнал от процесора, маркиращ валиден адрес и тип на цикъла на шината | [Гл. 11](11_bus_organization.md) |
| **ALU** | Arithmetic Logic Unit | Целочислено аритметично-логическо устройство | [Гл. 2](02_superscalar_architectures.md) |
| **AHOLD** | Address Hold | Сигнал, задържащ адресните изводи на процесора (при кеш-снифинг) | [Гл. 11](11_bus_organization.md) |
| **AVL** | Available | Бит в дескриптора, достъпен за ОС | [Гл. 6](06_segmentation.md) |
| **AVX** | Advanced Vector Extensions | 256-битови SIMD разширения (Sandy Bridge, 2011) | [Гл. 2](02_superscalar_architectures.md), [Гл. 3](03_data_types.md) |

---

## B

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **BE#** | Byte Enable | Сигнали, указващи кои байтове са валидни в текущия шинен цикъл (BE0#–BE7#) | [Гл. 11](11_bus_organization.md) |
| **BIOS** | Basic Input/Output System | Базова входно-изходна система; инициализира хардуера при стартиране | [Гл. 5](05_system_architecture.md) |
| **BLAST#** | Burst Last | Сигнал, указващ последния цикъл от пакетно предаване | [Гл. 11](11_bus_organization.md) |
| **BOFF#** | Back Off | Принуждава процесора да освободи шината незабавно | [Гл. 11](11_bus_organization.md) |
| **BRDY#** | Burst Ready | Сигнал за готовност при пакетен (burst) шинен цикъл | [Гл. 11](11_bus_organization.md) |
| **BTB** | Branch Target Buffer | Буфер за целеви адреси на преходи; компонент на динамичното предсказване | [Гл. 2](02_superscalar_architectures.md) |

---

## C

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **CAS** | Column Address Strobe / Cascade | (1) Сигнал за DRAM адресиране; (2) Линии CAS0–CAS2 за каскадиране на 8259A | [Гл. 14](14_interrupt_controllers.md) |
| **CISC** | Complex Instruction Set Computer | Архитектура с разширен набор от инструкции (x86 е CISC) | [Гл. 1](01_history_x86.md) |
| **CPL** | Current Privilege Level | Текущото ниво на привилегия на изпълняваната програма (CS[1:0]) | [Гл. 8](08_protection.md) |
| **CR0–CR4** | Control Registers | Управляващи регистри; CR0 управлява PE, PG; CR3 = PDBR; CR4 управлява PAE, PSE | [Гл. 7](07_paging.md), [Гл. 8](08_protection.md) |
| **CR3** | Control Register 3 (PDBR) | Физически адрес на Page Directory / PML4; смяната инвалидира TLB | [Гл. 7](07_paging.md) |

---

## D

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **DACK** | DMA Acknowledge | Сигнал от DMA контролера към периферното устройство, потвърждаващ предоставен канал | [Гл. 12](12_dma.md) |
| **DMA** | Direct Memory Access | Пряк достъп до паметта без участие на процесора | [Гл. 12](12_dma.md) |
| **DMI** | Direct Media Interface | Последователна шина между процесор и чипсет (заменя FSB в Nehalem и по-нови) | [Гл. 2](02_superscalar_architectures.md), [Гл. 5](05_system_architecture.md) |
| **DPL** | Descriptor Privilege Level | Ниво на привилегия на сегмент/шлюз, записано в дескриптора | [Гл. 6](06_segmentation.md), [Гл. 8](08_protection.md) |
| **DREQ** | DMA Request | Заявка от периферно устройство към DMA контролера за предоставяне на шината | [Гл. 12](12_dma.md) |

---

## E

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **EOP#** | End of Process | Сигнал, указващ края на DMA предаване | [Гл. 12](12_dma.md) |
| **EFLAGS** | Extended FLAGS register | 32-битов регистър на флаговете; съдържа IF, DF, NT, TF и пр. | [Гл. 4](04_programming_model.md), [Гл. 9](09_interrupts_exceptions.md) |

---

## F

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **FSB** | Front Side Bus | Предна системна шина; свързва процесор с MCH/Northbridge (заменена от QPI/DMI) | [Гл. 2](02_superscalar_architectures.md), [Гл. 5](05_system_architecture.md) |
| **FPU** | Floating-Point Unit | Устройство за операции с плаваща запетая | [Гл. 2](02_superscalar_architectures.md), [Гл. 3](03_data_types.md) |

---

## G

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **GDT** | Global Descriptor Table | Глобална дескрипторна таблица; обща за всички задачи в системата | [Гл. 6](06_segmentation.md), [Гл. 10](10_task_management.md) |
| **GDTR** | GDT Register | 48-битов регистър (база 32b + лимит 16b), указващ местоположението на GDT | [Гл. 6](06_segmentation.md) |
| **GPR** | General-Purpose Registers | Регистри с общо предназначение (EAX–EDI / RAX–R15) | [Гл. 4](04_programming_model.md) |

---

## H

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **HLDA** | Hold Acknowledge | Потвърждение от процесора, че е освободил шината (в отговор на HRQ) | [Гл. 12](12_dma.md) |
| **HOLD** | Hold Request (Bus Hold) | Заявка за управление на шината от друг шинен мастер | [Гл. 11](11_bus_organization.md) |
| **HIT#** | Cache Hit | Сигнал, указващ, че друг процесор притежава немодифициран ред в кеша | [Гл. 11](11_bus_organization.md), [Гл. 13](13_smp.md) |
| **HITM#** | Hit Modified | Сигнал, указващ, че друг процесор притежава **модифициран** ред (изисква обратен запис) | [Гл. 11](11_bus_organization.md), [Гл. 13](13_smp.md) |
| **HRQ** | Hold Request (DMA) | Заявка от DMA контролера към процесора за освобождаване на шината | [Гл. 12](12_dma.md) |
| **HTT** | Hyper-Threading Technology | Симултанно многонишково изпълнение (SMT); 2 логически CPU от 1 физически | [Гл. 2](02_superscalar_architectures.md) |

---

## I

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **ICR** | Interrupt Command Register | Регистър в LAPIC за изпращане на Inter-Processor Interrupts (IPI) | [Гл. 13](13_smp.md) |
| **ICW** | Initialization Command Word | Инициализираща командна дума (ICW1–ICW4) за 8259A PIC | [Гл. 14](14_interrupt_controllers.md) |
| **IDT** | Interrupt Descriptor Table | Дескрипторна таблица на прекъсванията; съдържа шлюзове за вектори 0–255 | [Гл. 9](09_interrupts_exceptions.md) |
| **IDTR** | IDT Register | 48-битов регистър, указващ местоположението на IDT | [Гл. 9](09_interrupts_exceptions.md) |
| **IFU** | Instruction Fetch Unit | Устройство за извличане на инструкции от кеша | [Гл. 2](02_superscalar_architectures.md) |
| **IMC** | Integrated Memory Controller | Вграден контролер на паметта в процесора (от Nehalem) | [Гл. 2](02_superscalar_architectures.md), [Гл. 5](05_system_architecture.md) |
| **IMR** | Interrupt Mask Register | Регистър на маската на прекъсванията в 8259A; маскира отделни IRQ линии | [Гл. 14](14_interrupt_controllers.md) |
| **INTA** | Interrupt Acknowledge | Цикъл за потвърждаване на прекъсване; два последователни цикъла с 4 такта помежду | [Гл. 11](11_bus_organization.md), [Гл. 14](14_interrupt_controllers.md) |
| **INTR** | Interrupt Request | Маскируем вход за прекъсване на процесора | [Гл. 9](09_interrupts_exceptions.md) |
| **IPI** | Inter-Processor Interrupt | Прекъсване, изпратено от един CPU до друг чрез APIC | [Гл. 13](13_smp.md) |
| **IRQ** | Interrupt Request | Заявка за прекъсване от периферно устройство | [Гл. 14](14_interrupt_controllers.md) |
| **IRR** | Interrupt Request Register | Регистър за заявки за прекъсвания в 8259A; защелква входящи IRQ сигнали | [Гл. 14](14_interrupt_controllers.md) |
| **ISR** | Interrupt Service Register | Регистър за обслужване на прекъсвания в 8259A; отбелязва текущо обработваното IRQ | [Гл. 14](14_interrupt_controllers.md) |
| **IST** | Interrupt Stack Table | Таблица с 7 стека за прекъсвания в 64-битовия TSS (Long Mode) | [Гл. 9](09_interrupts_exceptions.md), [Гл. 10](10_task_management.md) |
| **IU** | Integer Unit | Целочислено изпълнително устройство | [Гл. 2](02_superscalar_architectures.md) |

---

## J

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **JPU** | Jump Prediction Unit | Устройство за проверка на предсказани преходи в P6 | [Гл. 2](02_superscalar_architectures.md) |

---

## K

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **KEN#** | Cache Enable | Сигнал, разрешаващ кеширане на текущия шинен цикъл | [Гл. 11](11_bus_organization.md) |

---

## L

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **LAPIC** | Local Advanced Programmable Interrupt Controller | Локален APIC контролер, вграден в CPU кристала | [Гл. 13](13_smp.md) |
| **LDT** | Local Descriptor Table | Локална дескрипторна таблица; специфична за отделна задача | [Гл. 6](06_segmentation.md), [Гл. 10](10_task_management.md) |
| **LDTR** | LDT Register | 16-битов регистър (+ 64-битов кеш), указващ LDT на текущата задача | [Гл. 6](06_segmentation.md) |
| **LLC** | Last-Level Cache | Последно ниво на кеша (обикновено L3), споделено между всички ядра | [Гл. 2](02_superscalar_architectures.md), [Гл. 5](05_system_architecture.md) |

---

## M

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **MCH** | Memory Controller Hub | Северен мост (Northbridge) в традиционния чипсет; съдържа контролер на паметта | [Гл. 5](05_system_architecture.md) |
| **MESI** | Modified/Exclusive/Shared/Invalid | Протокол за съгласуваност на кешовете при SMP системи | [Гл. 13](13_smp.md) |
| **MMX** | MultiMedia eXtensions | 64-битови SIMD регистри (MM0–MM7) за целочислени операции (Pentium MMX, 1997) | [Гл. 3](03_data_types.md) |
| **MS** | Microcode Sequencer (MIS) | Устройство за генериране на µops от микрокод при сложни инструкции | [Гл. 2](02_superscalar_architectures.md) |

---

## N

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **NMI** | Non-Maskable Interrupt | Немаскируемо прекъсване; вектор 2; не се блокира с CLI | [Гл. 9](09_interrupts_exceptions.md) |
| **NT** | Nested Task | Флаг в EFLAGS; NT=1 показва вложена задача; IRET с NT=1 → превключване на задача | [Гл. 10](10_task_management.md) |

---

## O

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **OCW** | Operation Command Word | Оперативна командна дума (OCW1–OCW3) за управление на 8259A след инициализация | [Гл. 14](14_interrupt_controllers.md) |
| **OoO** | Out-of-Order (execution) | Извън-редно изпълнение на инструкции; оптимизира използването на изпълнителните устройства | [Гл. 2](02_superscalar_architectures.md) |

---

## P

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **PAE** | Physical Address Extension | Разширение на физическия адрес до 36 бита (от Pentium Pro) | [Гл. 7](07_paging.md) |
| **PCD** | Page Cache Disable | Бит в PTE/PDE или CR3; забранява кеширане на страницата | [Гл. 7](07_paging.md), [Гл. 11](11_bus_organization.md) |
| **PDE** | Page Directory Entry | Запис в Page Directory; указва Page Table или 4 MB физическа страница | [Гл. 7](07_paging.md) |
| **PDPT** | Page Directory Pointer Table | Трето ниво на PAE и Long Mode странициране (4 записа при PAE, 512 при Long Mode) | [Гл. 7](07_paging.md) |
| **PIC** | Programmable Interrupt Controller | Програмируем контролер на прекъсванията (Intel 8259A) | [Гл. 14](14_interrupt_controllers.md) |
| **PLOCK#** | Pseudo-Lock | Псевдозаключване при i486 за предавания > 32 бита | [Гл. 11](11_bus_organization.md) |
| **PML4** | Page Map Level 4 | Четвърто ниво на таблицата за странициране в Long Mode (512 × 8B записа) | [Гл. 7](07_paging.md) |
| **PSE** | Page Size Extension | CR4[4]; разрешава 4 MB (32-bit) или 2 MB (PAE) Large Pages | [Гл. 7](07_paging.md) |
| **PTE** | Page Table Entry | Запис в Page Table; указва физическия адрес на 4 KB страница и флагове | [Гл. 7](07_paging.md) |
| **PWT** | Page Write-Through | Бит в PTE/PDE; задава Write-Through кеширане на страницата | [Гл. 7](07_paging.md), [Гл. 11](11_bus_organization.md) |

---

## Q

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **QPI** | QuickPath Interconnect | Последователна точка-до-точка шина, заменяща FSB в Nehalem (2008) | [Гл. 2](02_superscalar_architectures.md), [Гл. 5](05_system_architecture.md) |

---

## R

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **RAT** | Register Alias Table | Таблица за преименуване на архитектурни регистри към физически (P6) | [Гл. 2](02_superscalar_architectures.md) |
| **RDY#** | Ready | Сигнал от паметта/ВУ за готовност при непакетен цикъл | [Гл. 11](11_bus_organization.md) |
| **RISC** | Reduced Instruction Set Computer | Архитектура с опростен набор от инструкции (вътрешното ядро на P6 е RISC) | [Гл. 1](01_history_x86.md), [Гл. 2](02_superscalar_architectures.md) |
| **ROB** | Reorder Buffer | Пул на инструкциите; позволява извън-редно изпълнение и в-ред завършване | [Гл. 2](02_superscalar_architectures.md) |
| **RPL** | Requested Privilege Level | Заявено ниво на привилегия в сегментния селектор (битове 1:0) | [Гл. 6](06_segmentation.md), [Гл. 8](08_protection.md) |
| **RS** | Reservation Station | Буфер, съхраняващ µops, чакащи за операнди; управлява OoO изпълнение | [Гл. 2](02_superscalar_architectures.md) |
| **RSB** | Return Stack Buffer | Буфер за предсказване на адреси при `RET` инструкции | [Гл. 2](02_superscalar_architectures.md) |

---

## S

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **SIMD** | Single Instruction, Multiple Data | Един такт обработва множество данни паралелно (MMX, SSE, AVX) | [Гл. 3](03_data_types.md) |
| **SMI#** | System Management Interrupt | Прекъсване за системно управление (преминаване в SMM режим) | [Гл. 11](11_bus_organization.md) |
| **SMM** | System Management Mode | Специален режим за управление на захранването и хардуерни функции | [Гл. 5](05_system_architecture.md) |
| **SMT** | Simultaneous Multi-Threading | Симултанно многонишково изпълнение (Intel го наименова HTT) | [Гл. 2](02_superscalar_architectures.md) |
| **SMP** | Symmetric Multi-Processing | Симетрична многопроцесорна архитектура; всички CPU споделят памет и APIC | [Гл. 13](13_smp.md) |
| **SSE** | Streaming SIMD Extensions | 128-битови SIMD регистри (XMM0–XMM15) за плаваща запетая (Pentium III, 1999) | [Гл. 3](03_data_types.md) |

---

## T

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **TI** | Table Indicator | Бит 2 на сегментния селектор; TI=0 → GDT; TI=1 → LDT | [Гл. 6](06_segmentation.md) |
| **TLB** | Translation Lookaside Buffer | Кеш за резултатите от страничната трансформация | [Гл. 7](07_paging.md) |
| **TR** | Task Register | Регистър, чийто видим 16-битов селектор указва TSS на текущата задача | [Гл. 10](10_task_management.md) |
| **TSS** | Task State Segment | Сегмент за съхранение на контекста на задача (регистри, стекове, LDT, CR3) | [Гл. 10](10_task_management.md) |
| **TSX** | Transactional Synchronization Extensions | Хардуерна транзакционна памет (Skylake) | [Гл. 2](02_superscalar_architectures.md) |

---

## U

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **UEFI** | Unified Extensible Firmware Interface | Наследник на BIOS; модерен фърмуерен интерфейс | [Гл. 5](05_system_architecture.md) |

---

## V

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **VEX** | Vector Extension prefix | Префикс на инструкциите за AVX/AVX2 (заменя REX + legacy SSE prefix) | [Гл. 3](03_data_types.md) |

---

## W

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **WB/WT#** | Write Back / Write Through | Сигнал, задаващ метода на кеширане за текущия шинен цикъл | [Гл. 11](11_bus_organization.md) |

---

## X

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **XD/NX** | Execute Disable / No-Execute | Бит в PTE; забранява изпълнение на код от страницата (защита от buffer-overflow атаки) | [Гл. 7](07_paging.md), [Гл. 8](08_protection.md) |
| **XMM** | XMM registers | 128-битови SIMD регистри (XMM0–XMM15) за SSE/SSE2/SSE4 | [Гл. 3](03_data_types.md) |

---

## Y / Z

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **YMM** | YMM registers | 256-битови SIMD регистри (YMM0–YMM15) за AVX/AVX2 | [Гл. 3](03_data_types.md) |
| **ZMM** | ZMM registers | 512-битови SIMD регистри (ZMM0–ZMM31) за AVX-512 | [Гл. 3](03_data_types.md) |

---

## µ (микро)

| Съкращение | Пълно наименование | Описание | Глава |
|---|---|---|---|
| **µop** | Micro-operation | Вътрешна RISC-подобна операция, в която декодерите разбиват CISC инструкции | [Гл. 2](02_superscalar_architectures.md) |

---

*Речникът обхваща всички съкращения от Глави I–XIV. При несъответствие — меродавен е текстът на съответната глава.*
